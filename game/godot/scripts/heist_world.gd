extends "res://scripts/road_story.gd"

# Preserve the original contracts, timer, delivery points and scoring in the coastal world.
const TARGETS := [Vector3(-10, 0, -32), Vector3(33, 0, 2), Vector3(-33, 0, 2)]
const NAMES := ["PANTHER GT", "AZURE XR", "SOLARIS V"]
const GARAGE := Vector3(0, 0, 31)
var vehicles: Array[Node3D] = []
var contract := 0
var score := 0
var goal_count := 3
var started := false
var finished := false
var heat := 0
var timer := 165.0
var impact_cooldown := 0.0

func _ready() -> void:
	super._ready()
	phase = "contracts"
	if OS.has_feature("demo"): goal_count = 1
	car.queue_free()
	milo.visible = false
	(milo as CharacterBody3D).collision_layer = 0
	milo_car.visible = false
	(milo_car as CharacterBody3D).collision_layer = 0
	for i in 3:
		var target := _car(["race", "race-future", "sedan-sports"][i], TARGETS[i], [PI, -PI / 2, PI / 2][i])
		vehicles.append(target)
	car = vehicles[0]
	avatar.position = Vector3(-13.5, 0, 10)
	_box(self, Vector3(10, .04, 10), GARAGE + Vector3(0, .08, 0), Color("#49c8c2"))
	for side in [-5.0, 5.0]:
		_box(self, Vector3(.35, 6, .35), GARAGE + Vector3(side, 3, -5), Color("#7af3d6"))
	_sign(GARAGE + Vector3(0, 6, 0), _words("garage"), Color("#7af3d6"))
	_show_gates()
	_update_ui()

func _input(event: InputEvent) -> void:
	if _camera_input(event): return
	if not event is InputEventKey or not event.pressed or event.echo: return
	if event.keycode == KEY_M:
		get_tree().change_scene_to_file("res://scenes/main.tscn")
		return
	if event.keycode == KEY_R:
		get_tree().reload_current_scene()
		return
	if finished: return
	if event.keycode in [KEY_W, KEY_A, KEY_S, KEY_D, KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_E]: started = true
	if event.keycode != KEY_E or float(avatar.get_meta("knock_time", 0.0)) > 0: return
	if driving and _car_speed() < 1.5:
		var exit_at := _safe_exit_position()
		if not exit_at.is_finite(): return
		driving = false
		avatar.visible = true
		(avatar as CharacterBody3D).collision_layer = 2
		avatar.position = exit_at
	elif not driving and avatar.position.distance_to(car.position) < 5:
		driving = true
		avatar.visible = false
		(avatar as CharacterBody3D).collision_layer = 0
		handling.reset((car as CharacterBody3D).velocity, car.rotation.y)

func _physics_process(delta: float) -> void:
	elapsed += delta
	impact_cooldown = maxf(0, impact_cooldown - delta)
	_walkers(delta)
	_cars(delta)
	# Parked mission cars are physical obstacles and can be pushed by passing traffic.
	for target in vehicles:
		if target != car and target.visible: _drive_body(target as CharacterBody3D, Vector3.ZERO, delta)
	if not driving and car.visible: _drive_body(car as CharacterBody3D, Vector3.ZERO, delta)
	if started and not finished:
		timer = maxf(0, timer - delta)
		if timer <= 0: finished = true
	if not driving and _knocked(avatar as CharacterBody3D, delta): return
	if not finished:
		_move(delta)
		if driving and not finished and car.position.distance_to(GARAGE) < 5 and _car_speed() < 5:
			_complete_delivery()
		if timer <= 0: finished = true
	elif driving:
		_drive_body(car as CharacterBody3D, Vector3.ZERO, delta)
	else:
		_person_motion(avatar as CharacterBody3D, Vector3.ZERO, delta)
	for body in [avatar, car]:
		if body.position.y < -8:
			body.position = Vector3(-13.5, .1, 10)
			(body as CharacterBody3D).velocity = Vector3.ZERO
			handling.reset()
			velocity = 0

func _drive_body(body: CharacterBody3D, motion: Vector3, delta: float) -> void:
	var prior_speed := motion.length()
	super._drive_body(body, motion, delta)
	if body != car or not driving or finished or impact_cooldown > 0: return
	for i in body.get_slide_collision_count():
		var hit := body.get_slide_collision(i)
		if absf(hit.get_normal().y) > .5: continue
		var normal_speed := absf(motion.dot(hit.get_normal()))
		if prior_speed > 3 and normal_speed > 2.5:
			heat += 1
			impact_cooldown = 1.8
			if heat >= 3: finished = true
			break

func _complete_delivery() -> void:
	score += 300 + ceili(timer * .5)
	car.visible = false
	(car as CharacterBody3D).collision_layer = 0
	(car as CharacterBody3D).collision_mask = 0
	driving = false
	contract += 1
	avatar.visible = true
	(avatar as CharacterBody3D).collision_layer = 2
	avatar.position = GARAGE + Vector3(-4, .1, 7)
	velocity = 0
	handling.reset()
	if contract >= goal_count:
		finished = true
		_report_score()
	else: car = vehicles[contract]

func _update_ui() -> void:
	if hud == null: return
	if finished:
		hud.text = _words("win") % score if contract >= goal_count else _words("time")
	else:
		hud.text = "NEON GETAWAY  |  %d/%d  |  %ds  |  %s %d/3" % [contract, goal_count, ceili(timer), _words("heat"), heat]
	var info := _words("garage") if driving else _words("enter") % NAMES[mini(contract, NAMES.size() - 1)]
	caption.text = info + "\n" + _words("back")
	caption.visible = true
	caption_bg.visible = true

func minimap_objective() -> Vector3:
	return GARAGE if driving or finished else car.position

func _words(key: String) -> String:
	const words := {
		"en":{"win":"ALL DELIVERED | %d PTS | R TO RESTART", "time":"RUN ENDED | R TO RESTART", "garage":"GARAGE • SLOW DOWN TO DELIVER", "enter":"%s • E TO ENTER", "heat":"HITS", "back":"M: STORY RACE"},
		"pt-BR":{"win":"ENTREGA CONCLUÍDA | %d PTS | R REINICIA", "time":"FUGA ENCERRADA | R REINICIA", "garage":"GARAGEM • REDUZA PARA ENTREGAR", "enter":"%s • E PARA ENTRAR", "heat":"COLISÕES", "back":"M: CORRIDA COM MILO"},
		"es":{"win":"ENTREGA COMPLETA | %d PTS | R REINICIA", "time":"FUGA TERMINADA | R REINICIA", "garage":"GARAJE • REDUCE PARA ENTREGAR", "enter":"%s • E PARA ENTRAR", "heat":"CHOQUES", "back":"M: CARRERA CON MILO"},
		"nl":{"win":"ALLE AUTO'S BEZORGD | %d PNT | R HERSTART", "time":"RIT VOORBIJ | R HERSTART", "garage":"GARAGE • REM OM AF TE LEVEREN", "enter":"%s • E OM IN TE STAPPEN", "heat":"BOTSINGEN", "back":"M: VERHAALRACE"}
	}
	return words[language][key]

func _report_score() -> void:
	if OS.has_feature("web"):
		JavaScriptBridge.eval("window.parent.postMessage({source:'neon-getaway',type:'score',score:%d}, window.location.origin)" % score)
