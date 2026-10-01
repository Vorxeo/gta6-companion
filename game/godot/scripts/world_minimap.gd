extends Control

# North-up map drawn from the same footprint registry that creates world geometry.
const RADIUS := 76.0
const CENTER := Vector2(90, 90)
const METRES_TO_PIXELS := .7
var world: Node3D
var refresh := 0.0
var clip := PackedVector2Array()

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	for i in 64:
		clip.append(CENTER + Vector2.from_angle(i * TAU / 64.0) * RADIUS)

func _process(delta: float) -> void:
	refresh += delta
	if refresh >= .1:
		refresh = 0
		queue_redraw()

func map_point(pos: Vector3, origin: Vector3) -> Vector2:
	return CENTER + Vector2(pos.x - origin.x, pos.z - origin.z) * METRES_TO_PIXELS

func _draw() -> void:
	if world == null or world.avatar == null: return
	var actor: Node3D = world.car if world.driving else world.avatar
	var origin: Vector3 = actor.position
	draw_circle(CENTER, RADIUS + 5, Color("#0c1d27"))
	draw_circle(CENTER, RADIUS, Color("#4d6959"))
	for feature in world.map_features:
		var rect: Rect2 = feature.rect
		var p := map_point(Vector3(rect.position.x, 0, rect.position.y), origin)
		var s := rect.size * METRES_TO_PIXELS
		if not Rect2(p, s).intersects(Rect2(CENTER - Vector2.ONE * RADIUS, Vector2.ONE * RADIUS * 2)): continue
		var polygon := PackedVector2Array([p, p + Vector2(s.x, 0), p + s, p + Vector2(0, s.y)])
		for part in Geometry2D.intersect_polygons(polygon, clip):
			# Tangent edges can produce a zero-area polygon at the circular boundary.
			if part.size() >= 3 and not Geometry2D.triangulate_polygon(part).is_empty():
				draw_colored_polygon(part, feature.color)
	if world.phase == "race":
		# Route samples use the actual race gates and road centerline.
		for z in range(int(origin.z) - 110, int(origin.z) + 110, 6):
			var p := map_point(Vector3(-4, 0, z), origin)
			if p.distance_to(CENTER) < RADIUS - 2: draw_circle(p, 1.6, Color("#6ff4d3"))
	for item in world.traffic:
		var p := map_point(item.car.position, origin)
		if p.distance_to(CENTER) < RADIUS - 4: draw_circle(p, 2.2, Color("#e6d7ad"))
	for person in world.crowd:
		var p := map_point(person.actor.position, origin)
		if p.distance_to(CENTER) < RADIUS - 4: draw_circle(p, 1.4, Color("#c6cacf"))
	var target: Vector3 = world.minimap_objective()
	var marker := map_point(target, origin) - CENTER
	marker = marker.limit_length(RADIUS - 8)
	draw_circle(CENTER + marker, 4.5, Color("#ffd58a"))
	var heading := -actor.rotation.y
	var arrow := PackedVector2Array()
	for point in [Vector2(0, -8), Vector2(5, 6), Vector2(0, 3), Vector2(-5, 6)]:
		arrow.append(CENTER + point.rotated(heading))
	draw_colored_polygon(arrow, Color.WHITE)
	draw_arc(CENTER, RADIUS + 2, 0, TAU, 64, Color("#d7f0ed"), 1.3, true)
	draw_string(ThemeDB.fallback_font, Vector2(84, 11), "N", HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)
	var hour: float = world.day_hour
	draw_string(ThemeDB.fallback_font, Vector2(68, 188), "%02d:%02d" % [int(hour), int(fmod(hour, 1) * 60)], HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)
