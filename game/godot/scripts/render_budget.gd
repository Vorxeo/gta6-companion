extends Node

# Compatibility/Web supports bilinear 3D scaling, not FSR/TAA. Canvas UI stays native.
# The policy samples real rendered frame intervals. Headless physics tests never tune it.
const WINDOW_SECONDS := 2.0
const WARMUP_SECONDS := 3.0
const BAD_FRAME_MS := 24.0
const GOOD_FRAME_MS := 18.5
const PROFILES := [
	{"scale": 1.0, "pixels": 3686400.0, "far": 520.0, "people": 135.0, "shadow": 96.0, "lod": 1.0, "msaa": Viewport.MSAA_2X},
	{"scale": .88, "pixels": 2764800.0, "far": 450.0, "people": 110.0, "shadow": 80.0, "lod": 1.5, "msaa": Viewport.MSAA_2X},
	{"scale": .76, "pixels": 2073600.0, "far": 380.0, "people": 90.0, "shadow": 64.0, "lod": 2.0, "msaa": Viewport.MSAA_DISABLED},
	{"scale": .65, "pixels": 1382400.0, "far": 320.0, "people": 75.0, "shadow": 48.0, "lod": 2.5, "msaa": Viewport.MSAA_DISABLED}
]

var tier := 0
var last_window: Dictionary = {}
var telemetry_enabled := false
var _viewport: Viewport
var _camera: Camera3D
var _sun: DirectionalLight3D
var _actors: Array[Dictionary] = []
var _samples: Array[float] = []
var _report_samples: Array[float] = []
var _window_elapsed := 0.0
var _warmup_remaining := WARMUP_SECONDS
var _dwell_remaining := 0.0
var _bad_windows := 0
var _good_windows := 0
var _last_tick_usec := 0
var _cull_elapsed := 0.0
var _report_elapsed := 0.0
var _last_size := Vector2.ZERO
var _background_check_remaining := 0.0
var _sample_active := true
var _sample_hidden := false
var _sample_focused := true
var _diagnostic_elapsed := 0.0
var _has_published_samples := false
var _telemetry_warmup_remaining := WARMUP_SECONDS
var _report_focused := true

func configure(viewport: Viewport, camera: Camera3D, sunlight: DirectionalLight3D) -> void:
	_viewport = viewport
	_camera = camera
	_sun = sunlight
	if OS.has_feature("web"):
		telemetry_enabled = bool(JavaScriptBridge.eval("new URLSearchParams(window.location.search).get('perf') === '1'"))
		if telemetry_enabled: _publish_report({"status": "warming up"})
	_apply_profile()
	_last_tick_usec = Time.get_ticks_usec()

func register_actor(actor: Node3D, visual: Node3D = null, animation: AnimationPlayer = null) -> void:
	if visual == null: visual = actor.get_meta("visual", null) as Node3D
	if animation == null: animation = actor.get_meta("animation", null) as AnimationPlayer
	if visual == null: return
	for existing in _actors:
		if existing.actor == actor: return
	var geometry: Array[GeometryInstance3D] = []
	if visual is GeometryInstance3D: geometry.append(visual as GeometryInstance3D)
	for part in visual.find_children("*", "GeometryInstance3D", true, false):
		geometry.append(part as GeometryInstance3D)
	_actors.append({"actor": actor, "visual": visual, "animation": animation, "geometry": geometry, "drawn": true})

func actor_is_drawn(actor: Node3D) -> bool:
	for item in _actors:
		if item.actor == actor: return item.drawn and actor.is_visible_in_tree()
	return actor.is_visible_in_tree()

func _process(delta: float) -> void:
	# Diagnose absent samples without inventing FPS. Run before every sampling guard.
	if telemetry_enabled and OS.has_feature("web") and not _has_published_samples:
		_diagnostic_elapsed += delta
		if _diagnostic_elapsed >= 2.0:
			_diagnostic_elapsed = 0.0
			_publish_report({"status": "sampling", "warmup_remaining": _warmup_remaining,
				"telemetry_warmup_remaining": _telemetry_warmup_remaining,
				"raw_interval": (Time.get_ticks_usec() - _last_tick_usec) / 1000000.0,
				"active": _sample_active, "display_server": DisplayServer.get_name(),
				"focused": _sample_focused, "hidden": _sample_hidden, "background": _sample_hidden or not _sample_focused,
				"process_frames": Engine.get_process_frames(), "rendered_frames": Engine.get_frames_drawn(),
				"report_frames": _report_samples.size(), "report_elapsed": _report_elapsed,
				"has_viewport": is_instance_valid(_viewport), "has_camera": is_instance_valid(_camera)})
	if _viewport == null or _camera == null: return
	_cull_elapsed += delta
	if _cull_elapsed >= .15:
		_cull_elapsed = 0.0
		update_actor_visuals(_camera.global_position)
	var size := _viewport.get_visible_rect().size
	if size != _last_size: _apply_profile()
	if DisplayServer.get_name() == "headless": return
	var now := Time.get_ticks_usec()
	var interval := (now - _last_tick_usec) / 1000000.0
	_last_tick_usec = now
	# A background tab must not turn a fast machine into the lowest profile.
	_background_check_remaining -= delta
	if _background_check_remaining <= 0:
		_background_check_remaining = .25
		if OS.has_feature("web"):
			_sample_hidden = bool(JavaScriptBridge.eval("document.hidden"))
			_sample_focused = bool(JavaScriptBridge.eval("document.hasFocus()"))
			_sample_active = not _sample_hidden and _sample_focused
		else:
			_sample_focused = DisplayServer.window_is_focused()
			_sample_active = _sample_focused
	if feed_frame(interval, _sample_active): _apply_profile()
	# Diagnostics describe presented frames, including browser background throttling.
	# This independent path cannot lower quality when the preview is unfocused.
	if telemetry_enabled and record_presented_frame(interval, not _sample_hidden, _sample_focused):
		if _report_elapsed >= 10.0:
			var report := snapshot()
			report.merge(_summarize(_report_samples), true)
			_publish_report(report)
			_has_published_samples = true
			_report_elapsed = 0.0
			_report_samples.clear()

func record_presented_frame(seconds: float, visible: bool, focused: bool = true) -> bool:
	if not visible:
		_report_elapsed = 0.0
		_report_samples.clear()
		return false
	if focused != _report_focused:
		_report_focused = focused
		_report_elapsed = 0.0
		_report_samples.clear()
		return false
	if not is_finite(seconds) or seconds <= 0 or seconds > 10.0: return false
	if _telemetry_warmup_remaining > 0:
		_telemetry_warmup_remaining = maxf(0, _telemetry_warmup_remaining - seconds)
		return false
	_report_samples.append(seconds * 1000.0)
	_report_elapsed += seconds
	return true

func _publish_report(report: Dictionary) -> void:
	# Diagnostic URL only: textContent and a JSON attribute expose actual samples for QA.
	# The normal game has no quality selector or performance overlay.
	var encoded := JSON.stringify(JSON.stringify(report))
	var script := """
	(function () {
		const report = JSON.parse(%s);
		let output = document.getElementById('neon-performance');
		if (!output) {
			output = document.createElement('output');
			output.id = 'neon-performance';
			output.setAttribute('aria-label', 'Game performance');
			Object.assign(output.style, {
				position: 'fixed', right: '10px', bottom: '10px', zIndex: '10000',
				padding: '9px 12px', color: '#e7fff3', background: 'rgba(7,19,29,.9)',
				border: '1px solid #3b7967', borderRadius: '8px', font: '12px/1.5 monospace',
				whiteSpace: 'pre-line', pointerEvents: 'none'
			});
			document.body.appendChild(output);
		}
		output.setAttribute('data-report', JSON.stringify(report));
		output.textContent = typeof report.fps === 'number'
			? (report.background ? 'BACKGROUND | ' : '') + report.fps.toFixed(1) + ' FPS | mean ' + report.mean_ms.toFixed(1) + 'ms | p95 ' + report.p95_ms.toFixed(1) + 'ms\\n'
			  + '3D scale ' + report.scale.toFixed(2) + ' | ' + report.frames + ' measured frames'
			: 'Measuring rendered frame intervals…';
		console.log('NEON_PERF ' + JSON.stringify(report));
	})();
	""" % encoded
	JavaScriptBridge.eval(script)

# Public deterministic input seam: tests feed frame intervals; production uses monotonic time.
# Returns true only when the renderer profile changed.
func feed_frame(seconds: float, active: bool = true) -> bool:
	if not active or not is_finite(seconds) or seconds <= 0 or seconds > 1.0:
		_clear_streaks()
		return false
	if _warmup_remaining > 0:
		_warmup_remaining = maxf(0, _warmup_remaining - seconds)
		return false
	_dwell_remaining = maxf(0, _dwell_remaining - seconds)
	_samples.append(seconds * 1000.0)
	_window_elapsed += seconds
	if _window_elapsed < WINDOW_SECONDS or _samples.size() < 12: return false
	last_window = _summarize(_samples)
	_samples.clear()
	_window_elapsed = 0.0
	if _dwell_remaining > 0:
		_bad_windows = 0
		_good_windows = 0
		return false
	var p90: float = last_window.p90_ms
	if p90 > BAD_FRAME_MS:
		_bad_windows += 1
		_good_windows = 0
	elif p90 < GOOD_FRAME_MS:
		_good_windows += 1
		_bad_windows = 0
	else:
		_bad_windows = 0
		_good_windows = 0
	var next_tier := tier
	if _bad_windows >= 2: next_tier = mini(PROFILES.size() - 1, tier + 1)
	elif _good_windows >= 6: next_tier = maxi(0, tier - 1)
	if next_tier == tier: return false
	tier = next_tier
	_bad_windows = 0
	_good_windows = 0
	# Resolution/detail cannot bounce on alternating easy and busy street frames.
	_dwell_remaining = 4.0
	return true

func _clear_streaks() -> void:
	_samples.clear()
	_window_elapsed = 0.0
	_bad_windows = 0
	_good_windows = 0

func resolution_scale(size: Vector2) -> float:
	if size.x <= 0 or size.y <= 0: return 1.0
	var profile: Dictionary = PROFILES[tier]
	var pixel_scale := sqrt(float(profile.pixels) / (size.x * size.y))
	# Aim for a 540px short edge; an extreme ultrawide canvas still obeys its pixel cap.
	var floor_scale := minf(1.0, 540.0 / minf(size.x, size.y))
	return minf(1.0, minf(maxf(float(profile.scale), floor_scale), pixel_scale))

func _apply_profile() -> void:
	if _viewport == null: return
	var profile: Dictionary = PROFILES[tier]
	_last_size = _viewport.get_visible_rect().size
	_viewport.scaling_3d_mode = Viewport.SCALING_3D_MODE_BILINEAR
	_viewport.scaling_3d_scale = resolution_scale(_last_size)
	_viewport.msaa_3d = profile.msaa
	_viewport.mesh_lod_threshold = profile.lod
	if _camera != null: _camera.far = profile.far
	if _sun != null:
		_sun.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
		_sun.directional_shadow_max_distance = profile.shadow
		_sun.directional_shadow_fade_start = .7
	if _camera != null: update_actor_visuals(_camera.global_position)

func update_actor_visuals(observer: Vector3) -> void:
	var limit := float(PROFILES[tier].people)
	for i in range(_actors.size() - 1, -1, -1):
		var item: Dictionary = _actors[i]
		if not is_instance_valid(item.actor) or not is_instance_valid(item.visual):
			_actors.remove_at(i)
			continue
		var actor := item.actor as Node3D
		var visual := item.visual as Node3D
		var distance := observer.distance_to(actor.global_position)
		var margin := 8.0 if item.drawn else -8.0
		item.drawn = distance <= limit + margin
		visual.visible = item.drawn
		var animation := item.animation as AnimationPlayer
		if is_instance_valid(animation): animation.active = item.drawn and actor.is_visible_in_tree()
		# Imported mesh LOD preserves detailed close characters; far figures use fewer triangles.
		var bias := 1.0 if distance < 18 else (.4 if distance < 45 else .12)
		for part in item.geometry:
			if not is_instance_valid(part): continue
			part.lod_bias = bias
			part.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if distance < 42 else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		# Physics bodies, collision layers, AI destinations and knockdown states remain untouched.

func snapshot() -> Dictionary:
	var drawn := 0
	for item in _actors:
		if is_instance_valid(item.actor) and item.drawn and item.actor.is_visible_in_tree(): drawn += 1
	return {
		"tier": tier, "scale": _viewport.scaling_3d_scale if _viewport != null else 1.0,
		"measured_at_ms": Time.get_ticks_msec(), "rendered_frames": Engine.get_frames_drawn(),
		"focused": _sample_focused, "hidden": _sample_hidden, "background": _sample_hidden or not _sample_focused,
		"sample_scope": "visible_presented_frames",
		"viewport": str(_viewport.get_visible_rect().size) if _viewport != null else "unconfigured",
		"people_drawn": drawn, "people_registered": _actors.size(),
		"draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
		"primitives": Performance.get_monitor(Performance.RENDER_TOTAL_PRIMITIVES_IN_FRAME),
		"process_ms": Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0,
		"physics_ms": Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0,
		"renderer": RenderingServer.get_current_rendering_method()
	}

func _summarize(values: Array[float]) -> Dictionary:
	if values.is_empty(): return {}
	var sorted := values.duplicate()
	sorted.sort()
	var sum := 0.0
	for value in sorted: sum += value
	var mean := sum / sorted.size()
	return {"frames": sorted.size(), "mean_ms": mean, "fps": 1000.0 / mean,
		"p50_ms": sorted[floori((sorted.size() - 1) * .5)],
		"p90_ms": sorted[floori((sorted.size() - 1) * .9)],
		"p95_ms": sorted[floori((sorted.size() - 1) * .95)],
		"p99_ms": sorted[floori((sorted.size() - 1) * .99)]}
