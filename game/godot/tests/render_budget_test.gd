extends SceneTree

const Budget := preload("res://scripts/render_budget.gd")
var passed := 0
var failed := 0

func _initialize() -> void:
	call_deferred("run")

func check(condition: bool, message: String) -> void:
	if condition:
		passed += 1
		print("PASS: ", message)
	else:
		failed += 1
		push_error("FAIL: " + message)

func feed(budget: Node, seconds: float, frame_ms: float) -> void:
	for i in ceili(seconds * 1000.0 / frame_ms): budget.feed_frame(frame_ms / 1000.0)

func run() -> void:
	var policy := Budget.new()
	feed(policy, 3.2, 16.0)
	feed(policy, 2.1, 45.0)
	check(policy.tier == 0, "one slow window does not lower quality")
	feed(policy, 2.1, 45.0)
	check(policy.tier == 1, "sustained slow render intervals lower one profile")
	feed(policy, 2.1, 16.0)
	check(policy.tier == 1, "quality cannot immediately bounce after a change")
	feed(policy, 16.0, 16.0)
	check(policy.tier == 0, "long healthy rendering restores detail gradually")
	feed(policy, 3.0, 16.0)
	policy.feed_frame(.9)
	feed(policy, 3.0, 16.0)
	check(policy.tier == 0, "an isolated loading hitch does not degrade detail")
	feed(policy, 10.0, 20.0)
	check(policy.tier == 0, "borderline frame intervals stay inside the hysteresis band")
	feed(policy, 2.1, 45.0)
	for i in 100: policy.feed_frame(.1, false)
	feed(policy, 2.1, 45.0)
	check(policy.tier == 0, "a hidden tab resets slow streaks instead of reducing quality")
	policy.feed_frame(NAN)
	policy.feed_frame(-.1)
	policy.feed_frame(5.0)
	check(policy.tier == 0, "invalid and suspended-tab intervals are excluded")
	var unfocused := Budget.new()
	for i in 20:
		unfocused.feed_frame(1.008, false)
		unfocused.record_presented_frame(1.008, true, false)
	var throttled: Dictionary = unfocused._summarize(unfocused._report_samples)
	check(throttled.frames >= 10 and throttled.fps > .9 and throttled.fps < 1.1 and unfocused.tier == 0, "visible background presentation is measured truthfully without degrading rendering quality")
	unfocused.record_presented_frame(.016, true, true)
	for i in 20: unfocused.record_presented_frame(.016, true, true)
	var foreground: Dictionary = unfocused._summarize(unfocused._report_samples)
	check(foreground.fps > 60 and foreground.p95_ms < 17, "focus recovery starts a separate window instead of mixing background throttling into foreground metrics")
	unfocused.record_presented_frame(.016, false)
	check(unfocused._report_samples.is_empty() and unfocused._report_elapsed == 0, "hidden tabs reset diagnostic samples instead of mixing suspended intervals")
	unfocused.free()
	feed(policy, 50.0, 45.0)
	check(policy.tier == 3, "sustained overload stops at the bounded minimum profile")
	check(is_equal_approx(policy.resolution_scale(Vector2(320, 240)), 1), "small canvases keep their native pixel resolution")
	check(policy.resolution_scale(Vector2(1280, 720)) * 720 >= 540, "automatic reduction preserves a readable 540px short edge")
	policy.tier = 0
	var scale: float = policy.resolution_scale(Vector2(3840, 2160))
	check(scale < 1 and 3840 * 2160 * scale * scale <= 3686401, "high DPI 3D pixel cost is bounded while the canvas stays native")
	policy.tier = 3
	var wide := Vector2(7680, 1080)
	var wide_scale: float = policy.resolution_scale(wide)
	check(wide.x * wide.y * wide_scale * wide_scale <= 1382401, "an ultrawide canvas cannot bypass the finite render pixel budget")
	policy.tier = 0
	check(is_equal_approx(policy.resolution_scale(Vector2(0, 0)), 1), "zero-sized canvas is safe during resize")
	var viewport := SubViewport.new()
	viewport.size = Vector2i(1280, 720)
	root.add_child(viewport)
	var world := Node3D.new()
	viewport.add_child(world)
	var camera := Camera3D.new()
	world.add_child(camera)
	var sun := DirectionalLight3D.new()
	world.add_child(sun)
	world.add_child(policy)
	policy.configure(viewport, camera, sun)
	check(viewport.scaling_3d_scale == 1 and viewport.size == Vector2i(1280, 720), "3D budget leaves 2D canvas dimensions intact")
	check(camera.far == 520 and sun.directional_shadow_max_distance == 96, "configured profile enforces finite draw and shadow distances")
	policy.tier = 3
	policy._apply_profile()
	check(viewport.scaling_3d_scale < 1 and viewport.size == Vector2i(1280, 720) and viewport.msaa_3d == Viewport.MSAA_DISABLED, "overload profile reduces actual 3D cost without resizing the HUD canvas")
	check(camera.far < 520 and sun.directional_shadow_max_distance < 96 and viewport.mesh_lod_threshold > 1, "overload profile enforces reduced draw distance, shadow range and mesh detail")
	policy.tier = 0
	policy._apply_profile()
	var actor := CharacterBody3D.new()
	actor.collision_layer = 2
	world.add_child(actor)
	var visual := Node3D.new()
	actor.add_child(visual)
	var mesh := MeshInstance3D.new()
	mesh.mesh = BoxMesh.new()
	visual.add_child(mesh)
	var animation := AnimationPlayer.new()
	actor.add_child(animation)
	policy.register_actor(actor, visual, animation)
	actor.position = Vector3(0, 0, 180)
	policy.update_actor_visuals(Vector3.ZERO)
	check(not visual.visible and actor.visible and actor.collision_layer == 2 and actor.process_mode == Node.PROCESS_MODE_INHERIT, "distant culling affects only the visual child, preserving the physical actor and AI")
	check(not animation.active and mesh.lod_bias < .2, "distant actors suspend animation and use imported mesh LOD")
	actor.position.z = 130
	policy.update_actor_visuals(Vector3.ZERO)
	check(not visual.visible, "cull distance hysteresis prevents edge flicker")
	actor.position.z = 12
	policy.update_actor_visuals(Vector3.ZERO)
	check(visual.visible and animation.active and mesh.lod_bias == 1, "approaching an actor restores its detailed visual and animation")
	actor.visible = false
	policy.update_actor_visuals(Vector3.ZERO)
	check(not policy.actor_is_drawn(actor) and not animation.active and not actor.visible, "render budget respects narrative root visibility")
	actor.queue_free()
	await process_frame
	policy.update_actor_visuals(Vector3.ZERO)
	check(policy.snapshot().people_registered == 0, "removed actors leave the budget registry safely")
	print("RENDER BUDGET: ", passed, " passed / ", failed, " failed")
	viewport.queue_free()
	await process_frame
	quit(0 if failed == 0 else 1)
