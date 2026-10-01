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

func frames(count: int) -> void:
	for i in count: await physics_frame

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var world = load("res://scenes/main.tscn").instantiate()
	root.add_child(world)
	current_scene = world
	await frames(15)
	for person in world.crowd: person.actor.queue_free()
	for item in world.traffic: item.car.queue_free()
	world.crowd.clear()
	world.traffic.clear()
	world.car.position = Vector3(80, 0, 40)
	world.milo_car.position = Vector3(80, 0, 20)
	await frames(2)
	var pedestrian := world._person(Vector3(-17.4, 0, -65), 0) as CharacterBody3D
	var routine := {"actor":pedestrian, "home":pedestrian.position, "role":0, "speed":1.2, "route":[Vector3(17.4, 0, -65), Vector3(17.4, 0, -90)], "leg":0, "wait":0.0}
	world.crowd.append(routine)
	var traffic_car := world._car("sedan-sports", Vector3(-5.4, 0, -35), 0) as CharacterBody3D
	traffic_car.velocity = Vector3(0, 0, -11)
	world.traffic.append({"car":traffic_car, "lane":-5.4, "speed":11.0, "current_speed":11.0})
	await frames(90)
	check(pedestrian.position.x < -16.8, "pedestrian waits on the curb for an approaching car")
	check(absf(traffic_car.velocity.z) < 10.5, "traffic brakes progressively for the waiting pedestrian")
	var minimum_clearance := INF
	for i in 2100:
		await physics_frame
		if absf(pedestrian.position.x) < 12:
			minimum_clearance = minf(minimum_clearance, absf(pedestrian.position.z - traffic_car.position.z))
	check(pedestrian.position.x > 16.5, "pedestrian crosses to the opposite sidewalk by walking")
	check(minimum_clearance > 4.5, "yielding car stays outside the occupied crossing")
	check(traffic_car.position.z < -100, "traffic resumes after the crossing clears")
	var visual := pedestrian.get_meta("visual") as Node3D
	visual.visible = false
	pedestrian.position = Vector3(0, .1, -150)
	world._vehicle_impacts(Vector3(0, 0, -152), Vector3(0, 0, -148), Vector3(0, 0, 10))
	check(pedestrian.velocity.y > 0 and pedestrian.get_meta("knock_time") > 0, "render culling does not disable pedestrian impact physics")
	await frames(260)
	check(pedestrian.get_meta("knock_time") <= 0, "culled knocked pedestrian still lands and recovers")
	world.elapsed = (23 - 9.5) * 40
	world._day_cycle()
	pedestrian.position = Vector3(-17.4, .1, -65)
	pedestrian.velocity = Vector3.ZERO
	routine.home = pedestrian.position
	routine.leg = 0
	routine.wait = 0.0
	var at_home := pedestrian.position
	await frames(120)
	check(pedestrian.position.distance_to(at_home) < .2, "daytime routine rests at home after closing hours")
	var route: Array[Vector3] = world._pedestrian_route(Vector3(17.4, 0, -130), 0)
	check(route[0].z in world.CROSSINGS and is_equal_approx(route[0].z, route[1].z), "shop route crosses at a marked world crossing")
	# Parked player vehicles are included in the same following rule as AI cars.
	world.car.position = Vector3(-5.4, 0, -100)
	world.car.velocity = Vector3.ZERO
	traffic_car.position = Vector3(-5.4, 0, -90)
	check(world._traffic_speed(traffic_car, Vector3.FORWARD, 11) < 11, "traffic slows for the player's parked car")
	world.phase = "race"
	world.driving = true
	world.avatar.collision_layer = 0
	world.car.velocity = Vector3(0, 0, -8)
	world.handling.reset(world.car.velocity, world.car.rotation.y)
	world.car.set_meta("push", Vector3(4, 0, 0))
	await frames(2)
	check(world.car.velocity.x > 0 and world.car.velocity.x < 5, "player collision impulse is consumed once rather than amplified every frame")
	world.driving = false
	world.car.position = Vector3(0, .1, -160)
	world.car.velocity = Vector3.ZERO
	world.car.set_meta("push", Vector3(0, 0, -5))
	pedestrian.position = Vector3(0, .1, -161)
	pedestrian.set_meta("immune_until", 0.0)
	await frames(2)
	check(pedestrian.get_meta("knock_time") > 0, "impulse-only parked car knocks down a pedestrian using actual travel")
	print("CITY TESTS: %d passed, %d failed" % [passed, failed])
	quit(1 if failed else 0)
