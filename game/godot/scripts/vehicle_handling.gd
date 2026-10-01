extends RefCounted

# Lightweight planar car handling. CharacterBody3D owns gravity and collision;
# this controller owns tires, steering and the automatic forward/reverse gear.
# Coordinates use a -Z nose. Feed the actual body velocity back after each slide.
const MAX_FORWARD_SPEED := 13.0
const MAX_REVERSE_SPEED := 5.0
const WHEELBASE := 2.65
const SERVICE_DECELERATION := 12.0
const HANDBRAKE_DECELERATION := 7.0
const REVERSE_SELECTION_TIME := .18
const TIRE_GRIP := 9.0
const HANDBRAKE_GRIP := 1.8
const MAX_CORNER_ACCELERATION := 6.5

var planar_velocity := Vector3.ZERO
var steering_angle := 0.0
var _drive_direction := 1
var _reverse_wait := 0.0

func reset(actual_velocity: Vector3 = Vector3.ZERO, yaw: float = 0.0) -> void:
	feedback(actual_velocity)
	steering_angle = 0.0
	_reverse_wait = 0.0
	var longitudinal := planar_velocity.dot(-Basis(Vector3.UP, yaw).z)
	_drive_direction = -1 if longitudinal < -.12 else 1

func feedback(actual_velocity: Vector3) -> void:
	# Using the collision result prevents a blocked car retaining a hidden speed
	# and jumping back to cruising speed when a wall or another car moves away.
	planar_velocity = Vector3(actual_velocity.x, 0.0, actual_velocity.z)

func step(delta: float, yaw: float, throttle: float, steer: float, service_brake: bool = false, handbrake: bool = false, grounded: bool = true) -> Dictionary:
	var dt := clampf(delta, 0.0, .1)
	var forward := -Basis(Vector3.UP, yaw).z
	var right := Basis(Vector3.UP, yaw).x
	var speed := planar_velocity.dot(forward)
	var lateral := planar_velocity.dot(right)
	var speed_fraction := clampf(absf(speed) / MAX_FORWARD_SPEED, 0.0, 1.0)
	var max_steer := lerpf(.50, .18, pow(speed_fraction, .75))
	steering_angle = move_toward(steering_angle, clampf(steer, -1, 1) * max_steer, 1.8 * dt)
	if dt <= 0 or not grounded:
		return _state(yaw, speed, lateral)

	speed = _longitudinal(speed, clampf(throttle, -1, 1), service_brake, handbrake, dt)
	# A bicycle curve links wheel angle to travel speed. The lateral acceleration
	# cap widens fast corners rather than allowing a stationary pivot at speed.
	var yaw_rate := -speed / WHEELBASE * tan(steering_angle)
	if handbrake: yaw_rate *= 1.2
	var corner_limit := (MAX_CORNER_ACCELERATION + 2.0 if handbrake else MAX_CORNER_ACCELERATION) / maxf(absf(speed), .5)
	yaw_rate = clampf(yaw_rate, -corner_limit, corner_limit)
	var next_yaw := wrapf(yaw + yaw_rate * dt, -PI, PI)
	var next_forward := -Basis(Vector3.UP, next_yaw).z
	var next_right := Basis(Vector3.UP, next_yaw).x
	# Rotate the body first, retaining momentum in world coordinates. Tires then
	# remove only the lateral speed they can grip this tick. Handbrake leaves slip.
	var momentum := forward * speed + right * lateral
	var next_speed := momentum.dot(next_forward)
	var next_lateral := move_toward(momentum.dot(next_right), 0.0, (HANDBRAKE_GRIP if handbrake else TIRE_GRIP) * dt)
	planar_velocity = next_forward * next_speed + next_right * next_lateral
	return _state(next_yaw, next_speed, next_lateral)

func _longitudinal(speed: float, throttle: float, service_brake: bool, handbrake: bool, dt: float) -> float:
	if service_brake or handbrake:
		_reverse_wait = 0.0
		return move_toward(speed, 0.0, (SERVICE_DECELERATION if service_brake else HANDBRAKE_DECELERATION) * dt)
	var request := int(signf(throttle))
	if request == 0:
		_reverse_wait = 0.0
		return move_toward(speed, 0.0, (.20 + .006 * speed * speed) * dt)
	if speed * request < -.12:
		_drive_direction = int(signf(speed))
		_reverse_wait = 0.0
		return move_toward(speed, 0.0, SERVICE_DECELERATION * absf(throttle) * dt)
	if request != _drive_direction and absf(speed) <= .12:
		_reverse_wait += dt
		if _reverse_wait >= REVERSE_SELECTION_TIME:
			_drive_direction = request
			_reverse_wait = 0.0
		return 0.0
	_drive_direction = request
	_reverse_wait = 0.0
	var limit := MAX_FORWARD_SPEED if request > 0 else MAX_REVERSE_SPEED
	var engine := 6.5 if request > 0 else 3.8
	var acceleration := engine * lerpf(1.0, .38, clampf(absf(speed) / limit, 0.0, 1.0)) * absf(throttle) - .12 - .002 * speed * speed
	# Light analog throttle can produce less force than rolling resistance.
	# It must then slow the car, rather than accidentally preserve its speed.
	return move_toward(speed, request * limit if acceleration > 0 else 0.0, absf(acceleration) * dt)

func _state(yaw: float, speed: float, lateral: float) -> Dictionary:
	return {"yaw":yaw, "velocity":planar_velocity, "speed":speed, "slip":lateral, "steering_angle":steering_angle}
