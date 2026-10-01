extends SceneTree

var passed := 0
var failed := 0

func check(condition: bool, message: String) -> void:
	if condition:
		passed += 1
		print("PASS: ", message)
	else:
		failed += 1
		push_error("FAIL: " + message)

func key(code: Key, pressed: bool) -> void:
	var event := InputEventKey.new()
	event.keycode = code
	event.physical_keycode = code
	event.pressed = pressed
	Input.parse_input_event(event)

func frames(count: int) -> void:
	for i in count: await physics_frame

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var game = load("res://scenes/main.tscn").instantiate()
	root.add_child(game)
	current_scene = game
	await frames(15)
	check(game.avatar is CharacterBody3D, "player is a physics body")
	check(game.car is CharacterBody3D, "car is a physics body")
	var traffic_car: Node3D = game.traffic[0].car
	var old_traffic := traffic_car.position
	await frames(30)
	var travel := traffic_car.position - old_traffic
	var visual_car := traffic_car.get_child(1) as Node3D
	check(travel.length() > .5 and visual_car.global_basis.z.normalized().dot(travel.normalized()) > .8, "traffic nose points along its actual travel")
	# Isolate static collision and route checks from random moving obstacles.
	for item in game.traffic: item.car.queue_free()
	game.traffic.clear()
	for item in game.crowd: item.actor.queue_free()
	game.crowd.clear()
	await frames(2)
	key(KEY_E, true)
	await frames(2)
	key(KEY_E, false)
	check(game.phase == "meet", "conversation requires proximity to Milo")
	game.avatar.position = game.milo.position + Vector3(0, 0, 3)
	key(KEY_E, true)
	await frames(2)
	key(KEY_E, false)
	check(game.phase == "talk", "E starts the friend conversation nearby")
	for line in 4:
		key(KEY_E, true)
		await frames(2)
		key(KEY_E, false)
		await frames(2)
	check(game.phase == "car" and game.time_left == 180, "dialogue unlocks car without starting the race clock")
	game.avatar.position = Vector3(-6, 0, 42)
	var start: Vector3 = game.avatar.position
	key(KEY_W, true)
	await frames(60)
	key(KEY_W, false)
	check(game.avatar.position.z < start.z - 1.5, "W moves north/forward")
	var visual: Node3D = game.avatar.get_meta("visual")
	check(visual.global_basis.z.z < -.9, "character visually faces the direction of forward travel")
	key(KEY_D, true)
	await frames(60)
	key(KEY_D, false)
	check(game.avatar.position.x > start.x + 1.5 and visual.global_basis.z.x > .8, "D moves and turns the character to the right")
	game.camera_yaw = PI / 2
	var rotated_start: Vector3 = game.avatar.position
	key(KEY_W, true)
	await frames(60)
	key(KEY_W, false)
	check(game.avatar.position.x < rotated_start.x - 1.5 and visual.global_basis.z.x < -.8, "W follows the camera's forward direction after orbiting")
	game.camera_yaw = 0
	game.avatar.position = Vector3(-20, .15, -30)
	(game.avatar as CharacterBody3D).velocity = Vector3.ZERO
	key(KEY_A, true)
	await frames(180)
	key(KEY_A, false)
	check(game.avatar.position.x > -26 and game.avatar.position.x < -24, "building collider stops a walking character")
	# Check a diagonal input slides along the same wall.
	var wall_start: Vector3 = game.avatar.position
	key(KEY_A, true)
	key(KEY_W, true)
	await frames(60)
	key(KEY_A, false)
	key(KEY_W, false)
	check(game.avatar.position.z < wall_start.z - .8 and game.avatar.position.x > -26, "wall contact slides without passing through")
	var map = load("res://scripts/world_minimap.gd").new()
	check(map.map_point(Vector3(10, 0, 10), Vector3(10, 0, 10)) == Vector2(90, 90), "minimap centers actual player coordinates")
	check(map.map_point(Vector3(20, 0, 20), Vector3(10, 0, 10)) == Vector2(97, 97), "minimap east/south scale matches the world")
	map.free()
	check(game.map_features.size() > 60, "minimap includes generated streets and buildings")
	game.elapsed = (22.0 - 9.5) * 40
	game._day_cycle()
	check(is_equal_approx(game.day_hour, 22.0) and game.sun.light_energy < .01, "night follows the sun cycle")
	game.elapsed = 0
	game._day_cycle()
	check(game.sun.light_energy > .4, "morning returns daylight")
	game.avatar.position = Vector3(0, .1, -100)
	game._vehicle_impacts(Vector3(0, 0, -102), Vector3(0, 0, -98), Vector3(0, 0, 10))
	check(game.avatar.velocity.y > 0 and game.avatar.get_meta("knock_time") > 0, "car impact launches the character")
	await frames(260)
	check(game.blood_marks.size() == 1 and game.avatar.get_meta("knock_time") <= 0, "impact lands, leaves a blood mark, and recovers")
	# Drive the complete 2.1 km route under the real 180-second clock.
	game.phase = "car"
	game.avatar.position = game.car.position + Vector3(2.5, 0, 0)
	key(KEY_E, true)
	await frames(2)
	key(KEY_E, false)
	check(game.phase == "race" and game.driving and not game.avatar.visible, "nearby E enters the car and starts the race")
	game.car.position = Vector3(-4, .1, 7)
	game.car.rotation = Vector3.ZERO
	game.car.velocity = Vector3.ZERO
	game.velocity = 0
	game.time_left = 180
	game.gate_index = 0
	key(KEY_W, true)
	await frames(10050)
	key(KEY_W, false)
	check(game.phase == "win" and game.gate_index == 7, "all race gates are reachable before timeout")
	check(game.time_left > 0 and game.time_left < 30, "clean race duration is close to three minutes")
	key(KEY_E, true)
	await frames(3)
	key(KEY_E, false)
	check(current_scene.scene_file_path == "res://scenes/heist.tscn", "finish connects to preserved original delivery missions")
	check(current_scene.goal_count == 3, "full build retains all three delivery contracts")
	print("STORY TESTS: %d passed, %d failed" % [passed, failed])
	quit(1 if failed else 0)
