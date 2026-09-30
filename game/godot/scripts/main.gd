extends Node3D

# Original fan-made 3D driving mission. Character art credited in assets/ATTRIBUTION.md.
const TARGETS := [Vector3(0, 0, -32), Vector3(33, 0, 2), Vector3(-33, 0, 2)]
const NAMES := ["PANTHER GT", "AZURE XR", "SOLARIS V"]
const GARAGE := Vector3(0, 0, 31)
var avatar: Node3D
var vehicle: Node3D
var vehicles: Array[Node3D] = []
var contract := 0
var score := 0
var goal_count := 3
var language := "en"
var started := false
var heat := 0
var collision_pause := 0.0
var follow_camera: Camera3D
var status: Label
var driving := false
var finished := false
var timer := 165.0
var velocity := 0.0
var animation: AnimationPlayer
var traffic: Array[Node3D] = []
var elapsed := 0.0

func _ready() -> void:
	if OS.has_feature("demo"):
		goal_count = 1
	if OS.has_feature("web"):
		var search = JavaScriptBridge.eval("window.location.search")
		for candidate in ["pt-BR", "es", "nl"]:
			if str(search).contains("lang=" + candidate):
				language = candidate
	RenderingServer.set_default_clear_color(Color("#11162b"))
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-48, -30, 0)
	light.light_color = Color("#ffc1d9")
	light.light_energy = 1.8
	add_child(light)
	var ambient := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("#11162b")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("#8193c9")
	env.ambient_light_energy = 0.8
	ambient.environment = env
	add_child(ambient)
	_box(self, Vector3(170, .2, 170), Vector3(0, -.15, 0), Color("#376f59"))
	_box(self, Vector3(18, .04, 160), Vector3.ZERO, Color("#263346"))
	_box(self, Vector3(160, .04, 18), Vector3.ZERO, Color("#263346"))
	for n in range(-7, 8):
		if abs(n) < 2: continue
		_box(self, Vector3(.13, .02, 2.9), Vector3(0, .04, n * 10.0), Color("#f8d88d"))
		_box(self, Vector3(2.9, .02, .13), Vector3(n * 10.0, .04, 0), Color("#f8d88d"))
	for x in [-39, 39]:
		for z in [-39, 39]:
			_box(self, Vector3(22, 18, 22), Vector3(x, 9, z), Color("#34334d"))
			_box(self, Vector3(23, .3, 23), Vector3(x, 18, z), Color("#a05a9c"))
			for floor in 5:
				for col in 4:
					_box(self, Vector3(2.4, 1.4, .08), Vector3(x - 7.5 + col * 5.0, 2.3 + floor * 3.0, z + 11.05), Color("#f8abcb") if (floor + col) % 3 else Color("#78dfea"))
	for x in [-65.0, -22.0, 22.0, 65.0]:
		for z in [-65.0, -22.0, 22.0, 65.0]:
			if absf(x) < 30 and absf(z) < 30:
				_garden(Vector3(x, 0, z))
			else:
				_palm(Vector3(x, 0, z))
	avatar = Node3D.new()
	add_child(avatar)
	avatar.position = Vector3(0, 0, 10)
	var human: PackedScene = load("res://assets/mannequiny.glb")
	var model := human.instantiate()
	avatar.add_child(model)
	animation = model.get_node("AnimationPlayer")
	animation.play("idle")
	for i in 3:
		var car := Node3D.new()
		add_child(car)
		car.position = TARGETS[i]
		car.rotation.y = [PI, -PI / 2.0, PI / 2.0][i]
		_car_model(car, ["race", "race-future", "sedan-sports"][i])
		vehicles.append(car)
	vehicle = vehicles[0]
	_box(self, Vector3(10, .04, 10), GARAGE + Vector3(0, .02, 0), Color("#49c8c2"))
	for side in [-5.0, 5.0]:
		_box(self, Vector3(.35, 6, .35), GARAGE + Vector3(side, 3, -5), Color("#7af3d6"))
	for i in 6:
		var moving_car := Node3D.new()
		add_child(moving_car)
		_car_model(moving_car, "suv-luxury" if i % 2 else "sedan-sports")
		traffic.append(moving_car)
	follow_camera = Camera3D.new()
	follow_camera.current = true
	follow_camera.fov = 60
	add_child(follow_camera)
	var ui := CanvasLayer.new()
	add_child(ui)
	var hud_back := ColorRect.new()
	hud_back.color = Color(0.045, 0.055, 0.13, 0.82)
	hud_back.anchor_right = 1.0
	hud_back.offset_left = 14
	hud_back.offset_top = 15
	hud_back.offset_right = -14
	hud_back.offset_bottom = 61
	ui.add_child(hud_back)
	status = Label.new()
	status.position = Vector2(24, 24)
	status.add_theme_font_size_override("font_size", 20)
	ui.add_child(status)

func _garden(at: Vector3) -> void:
	_box(self, Vector3(17, .15, 17), at, Color("#528d65"))
	_box(self, Vector3(2.2, .02, 17), at + Vector3(0, .1, 0), Color("#dbb990"))
	_box(self, Vector3(17, .02, 2.2), at + Vector3(0, .1, 0), Color("#dbb990"))
	for dx in [-6.0, 6.0]:
		for dz in [-6.0, 6.0]:
			_palm(at + Vector3(dx, 0, dz))

func _palm(at: Vector3) -> void:
	var tree := Node3D.new()
	add_child(tree)
	tree.position = at
	_box(tree, Vector3(.4, 5.2, .4), Vector3(0, 2.6, 0), Color("#a27a58"))
	for i in 7:
		var leaf := Node3D.new()
		tree.add_child(leaf)
		leaf.position = Vector3(0, 5.15, 0)
		leaf.rotation.y = float(i) * TAU / 7.0
		leaf.rotation.x = -.28
		_box(leaf, Vector3(.5, .13, 4.5), Vector3(0, 0, -2), Color("#62bb7f"))

func _car_model(root: Node3D, model_name: String) -> void:
	var packed: PackedScene = load("res://assets/%s.glb" % model_name)
	var model := packed.instantiate()
	root.add_child(model)
	model.scale = Vector3.ONE * 1.65

func _box(parent: Node3D, size: Vector3, at: Vector3, tint: Color) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	var material := StandardMaterial3D.new()
	material.albedo_color = tint
	mesh.material = material
	var instance := MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = at
	parent.add_child(instance)

func _blocked(at: Vector3, radius: float) -> bool:
	if absf(at.x) > 77 or absf(at.z) > 77:
		return true
	for x in [-39.0, 39.0]:
		for z in [-39.0, 39.0]:
			if absf(at.x - x) < 11 + radius and absf(at.z - z) < 11 + radius:
				return true
	return false

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	if event.keycode == KEY_R:
		get_tree().reload_current_scene()
		return
	if event is InputEventKey and event.pressed and event.keycode in [KEY_W, KEY_A, KEY_S, KEY_D, KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_E]:
		started = true
	if finished:
		return
	if event.keycode == KEY_E:
		if driving:
			driving = false
			avatar.position = vehicle.position + Vector3(3, 0, 0)
			avatar.visible = true
		elif avatar.position.distance_to(vehicle.position) < 5:
			driving = true
			avatar.position = vehicle.position
			avatar.visible = false

func _process(delta: float) -> void:
	elapsed += delta
	for i in traffic.size():
		var a := elapsed * (.22 if i % 2 else -.18) + float(i) * TAU / float(traffic.size())
		traffic[i].position = Vector3(sin(a) * (29.0 + float(i % 3) * 12.0), 0, cos(a) * (29.0 + float(i % 3) * 12.0))
		traffic[i].rotation.y = -a
	var focus := vehicle if driving else avatar
	if not finished:
		if started:
			timer = maxf(0, timer - delta)
		var direction := Vector2(
			float(Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT)) - float(Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT)),
			float(Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN)) - float(Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP))
		).normalized()
		if driving:
			velocity = clampf(velocity + (float(Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP)) - float(Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN))) * 22 * delta, -8, 30)
			if Input.is_key_pressed(KEY_SPACE):
				velocity *= maxf(0, 1 - 3 * delta)
			vehicle.rotation.y += -direction.x * velocity * .018 * delta
			var next_car := vehicle.position - vehicle.global_basis.z * velocity * delta
			if _blocked(next_car, 1.7):
				velocity *= -.2
			else:
				vehicle.position = next_car
			avatar.position = vehicle.position
			collision_pause = maxf(0, collision_pause - delta)
			for other in traffic:
				if collision_pause <= 0 and vehicle.position.distance_to(other.position) < 3.2:
					collision_pause = 1.8
					heat += 1
					velocity *= -.25
					if heat >= 3: finished = true
			if vehicle.position.distance_to(GARAGE) < 5:
				score += 300 + ceili(timer * .5)
				vehicle.visible = false
				driving = false
				contract += 1
				if contract >= goal_count:
					finished = true
					_report_score()
				else:
					vehicle = vehicles[contract]
					avatar.position = Vector3(0, 0, 10)
					avatar.visible = true
					velocity = 0
		else:
			var next_step := avatar.position + Vector3(direction.x, 0, direction.y) * (12.0 if Input.is_key_pressed(KEY_SHIFT) else 8.0) * delta
			if not _blocked(next_step, .5):
				avatar.position = next_step
			if direction.length() > .1:
				avatar.rotation.y = atan2(direction.x, -direction.y)
		var target_animation := "idle" if driving or direction.length() < .1 else "run"
		if animation.current_animation != target_animation:
			animation.play(target_animation, .15)
		if timer <= 0:
			finished = true
	var desired := focus.position + focus.global_basis.z * (9.0 if driving else 6.7) + Vector3(0, 5.2 if driving else 3.7, 0)
	follow_camera.position = follow_camera.position.lerp(desired, minf(1, delta * 5))
	follow_camera.look_at(focus.position + Vector3.UP)
	if finished:
		if contract >= goal_count:
			status.text = _words("win") % score
		else:
			status.text = _words("time")
	else:
		status.text = "NEON GETAWAY  |  %d/%d  |  %ds  |  %s  |  %s %d/3" % [contract, goal_count, ceili(timer), _words("garage") if driving else _words("enter") % NAMES[contract], _words("heat"), heat]

func _words(key: String) -> String:
	const translations := {
		"en": {"win": "ALL DELIVERED  |  %d PTS  |  R TO RESTART", "time": "RUN ENDED  |  R TO RESTART", "garage": "GARAGE", "enter": "%s / E TO ENTER", "heat": "HEAT"},
		"pt-BR": {"win": "ENTREGA CONCLUÍDA  |  %d PTS  |  R REINICIA", "time": "FUGA ENCERRADA  |  R REINICIA", "garage": "GARAGEM", "enter": "%s / E PARA ENTRAR", "heat": "ALERTA"},
		"es": {"win": "ENTREGA COMPLETA  |  %d PTS  |  R REINICIA", "time": "FUGA TERMINADA  |  R REINICIA", "garage": "GARAJE", "enter": "%s / E PARA ENTRAR", "heat": "ALERTA"},
		"nl": {"win": "ALLE AUTO'S BEZORGD  |  %d PNT  |  R HERSTART", "time": "RIT VOORBIJ  |  R HERSTART", "garage": "GARAGE", "enter": "%s / E OM IN TE STAPPEN", "heat": "ALARM"}
	}
	return translations[language][key]

func _report_score() -> void:
	if OS.has_feature("web"):
		JavaScriptBridge.eval("window.parent.postMessage({source:'neon-getaway',type:'score',score:%d}, window.location.origin)" % score)
