extends SceneTree

var passed := 0
var failed := 0
var Vehicle

func check(condition: bool, description: String) -> void:
	if condition:
		passed += 1
		print("PASS: ", description)
	else:
		failed += 1
		push_error("FAIL: " + description)

func _initialize() -> void:
	call_deferred("run")

func tick(controller, seconds: float, throttle: float, steer: float = 0.0, brake: bool = false, handbrake: bool = false, hz: int = 60) -> Dictionary:
	var yaw := 0.0
	var position := Vector3.ZERO
	var state := {}
	for frame in ceili(seconds * hz):
		state = controller.step(1.0 / hz, yaw, throttle, steer, brake, handbrake)
		yaw = state.yaw
		position += state.velocity / hz
	state["position"] = position
	return state

func turn_radius(speed: float) -> float:
	var controller = Vehicle.new()
	controller.reset(Vector3(0, 0, -speed))
	var yaw := 0.0
	var distance := 0.0
	var turn := 0.0
	for frame in 90:
		# Keep a chosen cruising speed to compare steering geometry fairly.
		controller.feedback(-Basis(Vector3.UP, yaw).z * speed)
		var state: Dictionary = controller.step(1.0 / 60, yaw, 0, 1)
		turn += absf(angle_difference(yaw, state.yaw))
		yaw = state.yaw
		distance += state.velocity.length() / 60
	return distance / maxf(turn, .001)

func run() -> void:
	Vehicle = load("res://scripts/vehicle_handling.gd")
	if Vehicle == null:
		check(false, "vehicle controller exists and loads")
		finish()
		return
	var forward = Vehicle.new()
	var first: Dictionary = forward.step(1.0 / 60, 0, 1, 0)
	check(first.speed > 0 and first.speed < .3, "throttle starts progressively instead of jumping to cruising speed")
	var state := tick(forward, 8, 1)
	check(absf(state.speed - 13) < .02, "forward speed reaches the 13 m/s race cap")
	check(absf(state.velocity.x) < .001 and state.velocity.z < 0, "canonical forward motion follows the vehicle's -Z nose")
	var reverse = Vehicle.new()
	state = tick(reverse, 5, -1)
	check(absf(state.speed + 5) < .02, "reverse gear is capped below forward cruising speed")
	var reversal = Vehicle.new()
	reversal.reset(Vector3(0, 0, -10))
	state = tick(reversal, .35, -1)
	check(state.speed > 4 and state.speed < 10, "pressing reverse while moving forward applies the service brake first")
	var saw_standstill := false
	var entered_reverse := false
	var crossed_without_stop := false
	for frame in 180:
		state = reversal.step(1.0 / 60, 0, -1, 0)
		if absf(state.speed) < .01: saw_standstill = true
		if state.speed < -.05:
			entered_reverse = true
			crossed_without_stop = not saw_standstill
			break
	check(saw_standstill and entered_reverse and not crossed_without_stop, "automatic reverse passes through standstill before changing direction")
	var hold = Vehicle.new()
	state = tick(hold, .1, -1)
	check(absf(state.speed) < .001, "reverse selection has a short standstill interlock")
	var reverse_to_forward = Vehicle.new()
	reverse_to_forward.reset(Vector3(0, 0, 5))
	state = tick(reverse_to_forward, .15, 1)
	check(state.speed < 0 and state.speed > -5, "forward throttle brakes backward travel before forward acceleration")
	var stop = Vehicle.new()
	stop.reset(Vector3(0, 0, -13))
	state = tick(stop, 1.2, 1, 0, true)
	check(absf(state.speed) < .001, "service brake overrides throttle and stops forward travel")
	var coast = Vehicle.new()
	coast.reset(Vector3(0, 0, -10))
	state = tick(coast, 1, 0)
	check(state.speed < 10 and state.speed > 8, "releasing throttle coasts with gradual rolling resistance")
	var light_throttle = Vehicle.new()
	light_throttle.reset(Vector3(0, 0, -10))
	state = tick(light_throttle, 1, .01)
	check(state.speed < 9.9, "very light analog throttle still loses speed to rolling resistance")
	var stationary = Vehicle.new()
	state = tick(stationary, 2, 0, 1)
	check(absf(state.yaw) < .001 and state.velocity.length() < .001, "steering at standstill does not rotate or slide the car")
	var right = Vehicle.new()
	right.reset(Vector3(0, 0, -8))
	state = tick(right, .5, 1, 1)
	check(state.yaw < -.1 and state.velocity.x > .5, "right input turns both the nose and forward travel right")
	var backward_right = Vehicle.new()
	backward_right.reset(Vector3(0, 0, 4))
	state = tick(backward_right, .5, -1, 1)
	check(state.yaw > .1, "reversing flips the steering rotation naturally")
	var low_radius := turn_radius(3)
	var fast_radius := turn_radius(13)
	check(low_radius > 3 and fast_radius > low_radius * 2, "high speed steering makes a wider curve than a parking turn")
	var grip = Vehicle.new()
	grip.reset(Vector3(4, 0, -8))
	state = tick(grip, .4, 0)
	check(absf(state.velocity.x) < 1, "tire grip settles a lateral collision impulse gradually")
	var regular = Vehicle.new()
	regular.reset(Vector3(0, 0, -10))
	var regular_turn := tick(regular, .6, 1, 1)
	var sliding = Vehicle.new()
	sliding.reset(Vector3(0, 0, -10))
	var sliding_turn := tick(sliding, .6, 1, 1, false, true)
	check(absf(sliding_turn.slip) > absf(regular_turn.slip) + .25 and sliding_turn.speed < regular_turn.speed, "handbrake reduces rear grip and speed so a turn can slide")
	var collided = Vehicle.new()
	tick(collided, 5, 1)
	collided.feedback(Vector3.ZERO)
	state = collided.step(1.0 / 60, 0, 1, 0)
	check(state.speed < .3, "collision feedback clears pre-impact cruising speed")
	collided.feedback(Vector3(2, 9, -3))
	check(collided.planar_velocity.is_equal_approx(Vector3(2, 0, -3)), "feedback preserves the actual post-collision planar velocity")
	var airborne = Vehicle.new()
	airborne.reset(Vector3(3, 0, -8))
	state = airborne.step(.05, 0, 1, 1, true, true, false)
	check(state.velocity.is_equal_approx(Vector3(3, 0, -8)) and is_zero_approx(state.yaw), "airborne tires do not steer, grip, or brake against empty air")
	var normal_rate = Vehicle.new()
	var high_rate = Vehicle.new()
	var at_60 := tick(normal_rate, 2, 1, .4, false, false, 60)
	var at_120 := tick(high_rate, 2, 1, .4, false, false, 120)
	check(at_60.position.distance_to(at_120.position) < .15 and absf(at_60.speed - at_120.speed) < .05, "handling remains consistent between 60 and 120 physics ticks")
	var race = Vehicle.new()
	var traveled := 0.0
	var race_seconds := 0.0
	while traveled < 2087 and race_seconds < 180:
		state = race.step(1.0 / 60, 0, 1, 0)
		traveled += -state.velocity.z / 60
		race_seconds += 1.0 / 60
	check(traveled >= 2087 and race_seconds > 150 and race_seconds < 180, "the full coastal route remains reachable within the three minute clock")
	print("Turn radii: parking %.2f m, cruising %.2f m; race %.2f s" % [low_radius, fast_radius, race_seconds])
	await test_wall_collision()
	finish()

func test_wall_collision() -> void:
	var fixture := Node3D.new()
	root.add_child(fixture)
	var floor_body := StaticBody3D.new()
	var floor_shape := CollisionShape3D.new()
	var floor_box := BoxShape3D.new()
	floor_box.size = Vector3(30, .2, 30)
	floor_shape.shape = floor_box
	floor_body.position.y = -.1
	floor_body.add_child(floor_shape)
	fixture.add_child(floor_body)
	var wall := StaticBody3D.new()
	var wall_shape := CollisionShape3D.new()
	var wall_box := BoxShape3D.new()
	wall_box.size = Vector3(8, 3, .3)
	wall_shape.shape = wall_box
	wall.position = Vector3(0, 1.5, -4)
	wall.add_child(wall_shape)
	fixture.add_child(wall)
	var car := CharacterBody3D.new()
	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(1.8, 1.1, 3.4)
	shape.shape = box
	shape.position.y = .7
	car.add_child(shape)
	car.position.y = .2
	fixture.add_child(car)
	var controller = Vehicle.new()
	await physics_frame
	var contacts := 0
	for frame in 150:
		await physics_frame
		var state: Dictionary = controller.step(1.0 / 60, car.rotation.y, 1, 0, false, false, car.is_on_floor())
		car.rotation.y = state.yaw
		car.velocity = Vector3(state.velocity.x, -1 if car.is_on_floor() else car.velocity.y - 23.0 / 60, state.velocity.z)
		car.move_and_slide()
		controller.feedback(car.velocity)
		for contact in car.get_slide_collision_count():
			if car.get_slide_collision(contact).get_collider() == wall: contacts += 1
	check(contacts > 0 and car.position.z > -2.25 and car.velocity.length() < .2, "real CharacterBody3D collision blocks the car at a wall")
	wall.queue_free()
	await physics_frame
	var restart: Dictionary = controller.step(1.0 / 60, car.rotation.y, 1, 0)
	check(restart.speed < .3, "removing a real wall restarts acceleration from the collision result")
	fixture.queue_free()

func finish() -> void:
	print("VEHICLE TESTS: %d passed, %d failed" % [passed, failed])
	quit(1 if failed else 0)
