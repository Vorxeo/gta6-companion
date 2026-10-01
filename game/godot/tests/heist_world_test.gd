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
	var world = load("res://scenes/heist.tscn").instantiate()
	root.add_child(world)
	current_scene = world
	await frames(15)
	check(world.goal_count == 3 and world.vehicles.size() == 3, "all original car contracts remain in the coastal chapter")
	check(world.car is CharacterBody3D and world.map_features.size() > 60, "delivery chapter shares real world collisions and circular-map geometry")
	check(world.minimap_objective() == world.car.position, "delivery map leads to the actual current target")
	check(world.timer == 165 and not world.started, "original delivery clock waits for player input")
	for item in world.traffic: item.car.queue_free()
	world.traffic.clear()
	for person in world.crowd: person.actor.queue_free()
	world.crowd.clear()
	await frames(2)
	key(KEY_E, true)
	await frames(2)
	key(KEY_E, false)
	check(not world.driving, "target car entry still requires proximity")
	world.avatar.position = Vector3(0, .1, -150)
	world._vehicle_impacts(Vector3(0, 0, -152), Vector3(0, 0, -148), Vector3(0, 0, 10))
	var timer_before: float = world.timer
	await frames(240)
	check(world.timer < timer_before - 3.5, "mission clock keeps running during pedestrian knockdown")
	for index in 3:
		world.car.position = Vector3(-1, .1, 26)
		world.car.rotation.y = PI
		world.avatar.position = world.car.position + Vector3(2.5, 0, 0)
		world.car.velocity = Vector3.ZERO
		key(KEY_E, true)
		await frames(2)
		key(KEY_E, false)
		check(world.driving and world.minimap_objective() == world.GARAGE, "contract %d car entry points the map to the garage" % (index + 1))
		world.car.velocity = Vector3(0, 0, 8)
		world.handling.reset(world.car.velocity, world.car.rotation.y)
		await frames(30)
		check(world.contract == index, "contract %d cannot be delivered at high speed" % (index + 1))
		key(KEY_SPACE, true)
		await frames(60)
		key(KEY_SPACE, false)
		check(world.contract == index + 1 and not world.vehicles[index].visible, "contract %d brakes and delivers exactly one car" % (index + 1))
		check(world.vehicles[index].collision_layer == 0, "delivered car %d no longer blocks the street" % (index + 1))
	check(world.finished and world.score >= 900 and world.score <= 2000, "all three retained contracts finish with valid original scoring")
	# Exercise damage with real car/wall collisions, then a stationary blocked car.
	world.finished = false
	world.score = 0
	world.heat = 0
	world.car = world.vehicles[0]
	world.car.visible = true
	world.car.collision_layer = 4
	world.car.collision_mask = 5
	world.driving = true
	world.avatar.visible = false
	world.avatar.collision_layer = 0
	for index in 3:
		world.car.position = Vector3(-20, .1, -30)
		world.car.rotation.y = PI / 2
		world.car.velocity = Vector3(-10, 0, 0)
		world.handling.reset(world.car.velocity, world.car.rotation.y)
		key(KEY_W, true)
		await frames(160)
		key(KEY_W, false)
		check(world.heat == index + 1, "wall impact %d counts once while the car remains blocked" % (index + 1))
	check(world.finished and world.score == 0, "three physical impacts end the run without awarding completion")
	world.car = world.vehicles[2]
	world.car.visible = true
	world.car.collision_layer = 4
	world.car.collision_mask = 5
	world.contract = 2
	world.finished = false
	world.heat = 2
	world.impact_cooldown = 0
	world.car.position = Vector3(0, .1, 26)
	world.car.rotation.y = PI
	world.car.velocity = Vector3(0, 0, 8)
	world.handling.reset(world.car.velocity, world.car.rotation.y)
	world._static_box(world, Vector3(6, 2, 1), Vector3(0, 1, 29))
	key(KEY_W, true)
	await frames(30)
	key(KEY_W, false)
	check(world.finished and world.contract == 2 and world.score == 0, "third impact in the garage cannot award delivery on the same frame")
	world.car.position = Vector3(24.4, .1, -30)
	world.car.rotation.y = 0
	world.car.velocity = Vector3.ZERO
	var exit_at: Vector3 = world._safe_exit_position()
	check(exit_at.is_finite() and exit_at.x < 25, "car exit chooses the free side when the other side is inside a building")
	world.finished = false
	world.driving = true
	world.velocity = 0
	world.car.velocity = Vector3(8, 0, 0)
	var exit_event := InputEventKey.new()
	exit_event.keycode = KEY_E
	exit_event.pressed = true
	world._input(exit_event)
	check(world.driving and world._car_speed() > 5, "sideways slip cannot pass the stopped-car exit or delivery speed gate")
	world.driving = false
	world.car.velocity = Vector3.ZERO
	world.car.set_meta("push", Vector3(-3, 0, 0))
	var parked_at: Vector3 = world.car.position
	await frames(5)
	check(world.car.position.x < parked_at.x, "current mission car responds to traffic impulses before the player enters")
	key(KEY_M, true)
	await frames(4)
	key(KEY_M, false)
	check(current_scene.scene_file_path == "res://scenes/main.tscn", "M returns from delivery missions to the story race")
	print("HEIST TESTS: %d passed, %d failed" % [passed, failed])
	quit(1 if failed else 0)
