extends Node3D

# Original, browser-sized coastal district. Assets and licenses: assets/ATTRIBUTION.md.
const GATES := [-240.0, -550.0, -850.0, -1160.0, -1480.0, -1780.0, -2080.0]
const CROSSINGS := [-65.0, -190.0, -315.0, -440.0]
const LINES := {
	"en": ["MILO: I found a beautiful car by the marina.", "YOU: Another heist?", "MILO: One clean getaway. Then race me through the city and coast highway to the forest lookout. Three minutes, give or take.", "YOU: Let's go. Show me the car."],
	"pt-BR": ["MILO: Encontrei um carro incrível na marina.", "VOCÊ: Outro roubo?", "MILO: Uma fuga limpa. Depois corremos pela cidade e autoestrada costeira até o mirante na floresta. Uns três minutos.", "VOCÊ: Vamos. Mostra o carro."],
	"es": ["MILO: Encontré un coche increíble en el puerto.", "TÚ: ¿Otro robo?", "MILO: Una huida limpia. Luego corremos por la ciudad y la autopista costera hasta el mirador del bosque. Unos tres minutos.", "TÚ: Vamos. Enséñame el coche."],
	"nl": ["MILO: Ik vond een prachtige auto bij de jachthaven.", "JIJ: Alweer een diefstal?", "MILO: Eén schone ontsnapping. Dan racen we door de stad en over de kustweg naar het uitzichtpunt in het bos. Ongeveer drie minuten.", "JIJ: Kom op. Laat de auto zien."]
}
const COPY := {
	"en": ["FIND MILO • E TO TALK", "E TO CONTINUE", "FIND THE PANTHER GT • E TO ENTER", "FOLLOW THE GLOWING GATES TO THE FOREST", "FOREST LOOKOUT REACHED!", "TIME UP • R TO RESTART", "E: CAR-HEIST CHAPTER • R: RACE AGAIN"],
	"pt-BR": ["ENCONTRE MILO • E PARA CONVERSAR", "E PARA CONTINUAR", "ENCONTRE O PANTHER GT • E PARA ENTRAR", "SIGA OS PORTAIS BRILHANTES ATÉ A FLORESTA", "VOCÊ CHEGOU AO MIRANTE!", "TEMPO ESGOTADO • R PARA RECOMEÇAR", "E: MISSÕES DE ENTREGA • R: CORRER DE NOVO"],
	"es": ["ENCUENTRA A MILO • E PARA HABLAR", "E PARA CONTINUAR", "BUSCA EL PANTHER GT • E PARA ENTRAR", "SIGUE LOS ARCOS BRILLANTES HASTA EL BOSQUE", "¡LLEGASTE AL MIRADOR!", "TIEMPO AGOTADO • R PARA REINICIAR", "E: MISIONES DE ROBO • R: CORRER DE NUEVO"],
	"nl": ["ZOEK MILO • E OM TE PRATEN", "E OM VERDER TE GAAN", "ZOEK DE PANTHER GT • E OM IN TE STAPPEN", "VOLG DE LICHTPOORTEN NAAR HET BOS", "BOSUITZICHT BEREIKT!", "TIJD OM • R OM OPNIEUW TE BEGINNEN", "E: AUTO-OPDRACHTEN • R: OPNIEUW RACEN"]
}
const AREAS := {
	"en": ["MARINA DISTRICT", "CITY", "COAST HIGHWAY", "FOREST"],
	"pt-BR": ["BAIRRO DA MARINA", "CIDADE", "AUTOESTRADA COSTEIRA", "FLORESTA"],
	"es": ["BARRIO DEL PUERTO", "CIUDAD", "AUTOPISTA COSTERA", "BOSQUE"],
	"nl": ["JACHTHAVEN", "STAD", "KUSTSNELWEG", "BOS"]
}
var language := "en"
var phase := "meet"
var step := 0
var avatar: Node3D
var milo: Node3D
var car: Node3D
var milo_car: Node3D
var camera: Camera3D
var hud: Label
var caption: Label
var caption_bg: ColorRect
var crowd: Array[Dictionary] = []
var traffic: Array[Dictionary] = []
var gates: Array[Node3D] = []
var gate_index := 0
var time_left := 180.0
var velocity := 0.0
var elapsed := 0.0
var cooldown := 0.0
var driving := false
var sun: DirectionalLight3D
var sky_material: ProceduralSkyMaterial
var environment: Environment
var day_hour := 9.5
var map_features: Array[Dictionary] = []
var mesh_cache: Dictionary = {}
var material_cache: Dictionary = {}
var blood_marks: Array[Node3D] = []
var static_meshes: Array[MeshInstance3D] = []
var street_lamps: Array[MeshInstance3D] = []
var camera_yaw := 0.0
var camera_orbit_hold := 0.0
var sky_refresh := 0.0
var handling = preload("res://scripts/vehicle_handling.gd").new()
var render_budget: Node

func _ready() -> void:
	if OS.has_feature("web"):
		var query := str(JavaScriptBridge.eval("window.location.search"))
		for candidate in ["pt-BR", "es", "nl"]:
			if query.contains("lang=" + candidate): language = candidate
	_lighting()
	_world()
	_dense_districts()
	_batch_static_geometry()
	avatar = _person(Vector3(-13.5, 0, 42), 0)
	milo = _person(Vector3(-13.5, 0, 24), PI)
	car = _car("race", Vector3(-10, 0, 7), 0)
	milo_car = _car("race-future", Vector3(10, 0, 7), 0)
	_people()
	_traffic()
	_gates()
	camera = Camera3D.new()
	camera.current = true
	camera.fov = 60
	camera.far = 520
	add_child(camera)
	camera.position = avatar.position + Vector3(0, 3.3, 5.5)
	render_budget = preload("res://scripts/render_budget.gd").new()
	add_child(render_budget)
	render_budget.configure(get_viewport(), camera, sun)
	render_budget.register_actor(avatar)
	render_budget.register_actor(milo)
	for person in crowd: render_budget.register_actor(person.actor)
	_ui()
	_update_ui()

func _mat(color: Color, rough: float = .82, metal: float = 0.0) -> StandardMaterial3D:
	var key := "%s:%s:%s" % [color, rough, metal]
	if material_cache.has(key): return material_cache[key]
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(color.r * .65, color.g * .65, color.b * .65, color.a)
	m.roughness = rough
	m.metallic = metal
	m.metallic_specular = .15
	material_cache[key] = m
	return m

func _terrain_mat(path: String, tiles_x: float, tiles_z: float) -> StandardMaterial3D:
	var m := _mat(Color.WHITE).duplicate() as StandardMaterial3D
	m.albedo_color = Color(.55, .55, .55) if path.contains("asphalt") else Color(.62, .72, .62)
	m.albedo_texture = load(path)
	m.uv1_scale = Vector3(tiles_x, tiles_z, 1)
	m.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
	return m

func _box(parent: Node3D, size: Vector3, pos: Vector3, color: Color, rough: float = .82, metal: float = 0.0) -> MeshInstance3D:
	var key := "box:%s:%s:%s:%s" % [size, color, rough, metal]
	if not mesh_cache.has(key):
		var new_mesh := BoxMesh.new()
		new_mesh.size = size
		new_mesh.material = _mat(color, rough, metal)
		mesh_cache[key] = new_mesh
	var mesh: BoxMesh = mesh_cache[key]
	var part := MeshInstance3D.new()
	part.mesh = mesh
	part.position = pos
	parent.add_child(part)
	static_meshes.append(part)
	return part

func _cylinder(parent: Node3D, top: float, bottom: float, height: float, pos: Vector3, color: Color) -> void:
	var key := "cylinder:%s:%s:%s:%s" % [top, bottom, height, color]
	if not mesh_cache.has(key):
		var new_mesh := CylinderMesh.new()
		new_mesh.top_radius = top
		new_mesh.bottom_radius = bottom
		new_mesh.height = height
		new_mesh.radial_segments = 8
		new_mesh.material = _mat(color)
		mesh_cache[key] = new_mesh
	var mesh: CylinderMesh = mesh_cache[key]
	var part := MeshInstance3D.new()
	part.mesh = mesh
	part.position = pos
	parent.add_child(part)
	static_meshes.append(part)

func _lighting() -> void:
	sun = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-38, -25, 0)
	sun.light_color = Color("#ffdfb4")
	sun.light_energy = .85
	sun.shadow_enabled = true
	add_child(sun)
	var world := WorldEnvironment.new()
	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	var sky := Sky.new()
	sky.process_mode = Sky.PROCESS_MODE_INCREMENTAL
	sky.radiance_size = Sky.RADIANCE_SIZE_128
	var atmosphere := ProceduralSkyMaterial.new()
	sky_material = atmosphere
	atmosphere.sky_top_color = Color("#5185a7")
	atmosphere.sky_horizon_color = Color("#d1d6cc")
	atmosphere.ground_horizon_color = Color("#b8c1ae")
	atmosphere.ground_bottom_color = Color("#769088")
	sky.sky_material = atmosphere
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	env.ambient_light_energy = .42
	env.reflected_light_source = Environment.REFLECTION_SOURCE_BG
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	world.environment = env
	environment = env
	add_child(world)

func _world() -> void:
	var grass := _box(self, Vector3(510, .3, 2220), Vector3(0, -.23, -1010), Color("#69876a"))
	_static_box(self, Vector3(510, .3, 2220), Vector3(0, -.15, -1010))
	grass.set_surface_override_material(0, _terrain_mat("res://assets/leafy_grass_diff_1k.jpg", 50, 215))
	var road := _box(self, Vector3(25, .055, 2160), Vector3(0, .02, -1010), Color("#383d43"))
	road.set_surface_override_material(0, _terrain_mat("res://assets/asphalt_02_diff_1k.jpg", 3, 210))
	_map_rect(Vector3(0, 0, -1010), Vector3(25, 0, 2160), Color("#40494d"))
	for z in range(40, -2100, -18):
		_box(self, Vector3(.15, .05, 7), Vector3(0, .055, z), Color("#e9d9ad"))
	for side in [-1.0, 1.0]:
		_box(self, Vector3(2.4, .07, 550), Vector3(side * 13.4, .04, -215), Color("#b9bbb4"))
		_box(self, Vector3(.33, .1, 940), Vector3(side * 12.3, .08, -1030), Color("#f4ead4"))
		for z in range(-570, -1470, -27):
			_box(self, Vector3(.13, .06, 9), Vector3(side * 6.3, .065, z), Color("#eee0bb"))
	for z in CROSSINGS:
		_box(self, Vector3(310, .06, 16), Vector3(0, .045, z), Color("#464b4d"))
		_map_rect(Vector3(0, 0, z), Vector3(310, 0, 16), Color("#40494d"))
		for stripe_x in range(-12, 13, 3):
			_box(self, Vector3(1.6, .025, 3), Vector3(stripe_x, .09, z), Color("#d8d3bb"))
	for x in [-125.0, -65.0, 65.0, 125.0]:
		_box(self, Vector3(13, .06, 535), Vector3(x, .045, -215), Color("#464b4d"))
		_map_rect(Vector3(x, 0, -215), Vector3(13, 0, 535), Color("#40494d"))
	var rng := RandomNumberGenerator.new()
	rng.seed = 42619
	for row in 4:
		for col in 3:
			for side in [-1.0, 1.0]:
				_building(Vector3(side * [37.0, 94.0, 151.0][col], 0, -30 - row * 125), rng.randf_range(11, 34))
	_box(self, Vector3(135, .05, 550), Vector3(191, -.05, -205), Color("#d6c196"))
	_box(self, Vector3(95, .07, 1560), Vector3(288, -.05, -760), Color("#277d92"), .28, .18)
	_map_rect(Vector3(288, 0, -760), Vector3(95, 0, 1560), Color("#315c77"))
	for z in range(0, -530, -40):
		_palm(Vector3(-20, 0, z))
		_palm(Vector3(22, 0, z - 17))
	for z in range(-560, -1450, -65):
		for side in [-1.0, 1.0]:
			_box(self, Vector3(.35, 1.2, 51), Vector3(side * 15.5, .6, z), Color("#aab4b0"))
			_static_box(self, Vector3(.35, 1.2, 51), Vector3(side * 15.5, .6, z))
	for i in 185:
		var z := rng.randf_range(-2110, -1460)
		var x := rng.randf_range(-220, 220)
		if absf(x) > 22: _tree(Vector3(x, 0, z), rng.randf_range(.75, 1.35))
	for i in 55:
		var z := rng.randf_range(-1450, -580)
		var x := rng.randf_range(-195, 195)
		if absf(x) > 24: _tree(Vector3(x, 0, z), rng.randf_range(.65, 1.1))
	_box(self, Vector3(60, .08, 32), Vector3(0, .02, -2090), Color("#aa9575"))
	for side in [-1.0, 1.0]:
		_cylinder(self, .55, .8, 13, Vector3(side * 18, 6.5, -2075), Color("#6a655c"))

func _building(at: Vector3, h: float) -> void:
	var palette := [Color("#89715f"), Color("#477978"), Color("#706b81"), Color("#9b7863")]
	var color: Color = palette[int(absf(at.z) + absf(at.x)) % 4]
	_box(self, Vector3(22, h, 28), at + Vector3(0, h / 2, 0), color)
	_static_box(self, Vector3(22, h, 28), at + Vector3(0, h / 2, 0))
	_map_rect(at, Vector3(22, 0, 28), Color("#aaa296"))
	_box(self, Vector3(23, .6, 29), at + Vector3(0, h + .3, 0), Color("#62666a"))
	for floor in int(h / 3.6):
		for col in 3:
			var glass := Color("#284b5c") if (floor + col) % 3 else Color("#697660")
			_box(self, Vector3(3.1, 1.8, .08), at + Vector3(-7 + col * 7, 2.5 + floor * 3.6, 14.04), glass, .15, .1)
			for side in [-1.0, 1.0]:
				_box(self, Vector3(.08, 1.8, 3.1), at + Vector3(side * 11.04, 2.5 + floor * 3.6, -8 + col * 8), glass, .4, .1)

func _tree(at: Vector3, size: float) -> void:
	var root := Node3D.new()
	add_child(root)
	root.position = at
	root.scale = Vector3.ONE * size
	_cylinder(root, .25, .48, 6, Vector3(0, 3, 0), Color("#685342"))
	_static_box(root, Vector3(.8, 6, .8), Vector3(0, 3, 0))
	for i in 3:
		var key := "leaves:%d" % i
		if not mesh_cache.has(key):
			var new_mesh := SphereMesh.new()
			new_mesh.radius = 3.3 - i * .52
			new_mesh.height = 4.6 - i * .3
			new_mesh.radial_segments = 7
			new_mesh.rings = 4
			new_mesh.material = _mat(Color("#436e51") if i % 2 else Color("#587f5b"))
			mesh_cache[key] = new_mesh
		var mesh: SphereMesh = mesh_cache[key]
		var crown := MeshInstance3D.new()
		crown.mesh = mesh
		crown.position = Vector3(0, 6.7 + i * 1.55, 0)
		root.add_child(crown)
		static_meshes.append(crown)

func _palm(at: Vector3) -> void:
	var root := Node3D.new()
	add_child(root)
	root.position = at
	_cylinder(root, .17, .34, 7.5, Vector3(0, 3.75, 0), Color("#8e6b4f"))
	_static_box(root, Vector3(.6, 7.5, .6), Vector3(0, 3.75, 0))
	for i in 7:
		var leaf := _box(root, Vector3(.6, .13, 5), Vector3(0, 7.5, 0), Color("#4b855d"))
		leaf.rotation = Vector3(-.28, i * TAU / 7.0, 0)

func _person(at: Vector3, yaw: float) -> Node3D:
	var root := CharacterBody3D.new()
	root.collision_layer = 2
	root.collision_mask = 7
	root.floor_snap_length = .3
	add_child(root)
	root.position = at
	root.rotation.y = yaw
	var shape := CapsuleShape3D.new()
	shape.radius = .3
	shape.height = 1.7
	var collider := CollisionShape3D.new()
	collider.shape = shape
	collider.position.y = .85
	root.add_child(collider)
	var visual := Node3D.new()
	visual.name = "Visual"
	visual.rotation.y = PI # glTF faces +Z; game movement uses -Z.
	root.add_child(visual)
	root.set_meta("visual", visual)
	root.set_meta("knock_time", 0.0)
	root.set_meta("immune_until", 0.0)
	root.set_meta("landed", false)
	var body := (load("res://assets/vitruvian_body.glb") as PackedScene).instantiate()
	var head := (load("res://assets/vitruvian_head.glb") as PackedScene).instantiate()
	visual.add_child(body)
	var head_mount := Node3D.new()
	visual.add_child(head_mount)
	head_mount.add_child(head)
	# The head follows the animated neck rather than floating at a fixed world height.
	var skeletons := body.find_children("*", "Skeleton3D", true, false)
	if not skeletons.is_empty():
		var skeleton := skeletons[0] as Skeleton3D
		for i in skeleton.get_bone_count():
			if skeleton.get_bone_name(i).ends_with("Head"):
				var attachment := BoneAttachment3D.new()
				attachment.bone_name = skeleton.get_bone_name(i)
				skeleton.add_child(attachment)
				head_mount.reparent(attachment, false)
				head_mount.transform = skeleton.get_bone_global_rest(i).affine_inverse()
				break
	var outfits := [Color("#4e7b86"), Color("#b06555"), Color("#6e647f"), Color("#b7a477")]
	var outfit: Color = outfits[absi(int(at.x * 3 + at.z)) % outfits.size()]
	_style_person(body, outfit)
	_style_person(head, outfit)
	# A simple short-hair cap keeps the lightweight Web model readable at driving distance.
	var hair := SphereMesh.new()
	hair.radius = .135
	hair.height = .16
	hair.radial_segments = 10
	hair.rings = 5
	hair.material = _mat(Color("#302a27"))
	var hair_part := MeshInstance3D.new()
	hair_part.mesh = hair
	hair_part.position = Vector3(0, 1.77, -.015)
	head_mount.add_child(hair_part)
	var anim := body.get_node_or_null("AnimationPlayer") as AnimationPlayer
	if anim:
		root.set_meta("animation", anim)
		anim.play("Idle")
	return root

func _style_person(root: Node, outfit: Color) -> void:
	if root is MeshInstance3D:
		var part := root as MeshInstance3D
		for i in part.mesh.get_surface_count():
			var source := part.mesh.surface_get_material(i)
			if source == null: continue
			var name := source.resource_name.to_lower()
			var styled := StandardMaterial3D.new()
			styled.roughness = .83
			if name.contains("shirt"): styled.albedo_color = outfit
			elif name.contains("pants"): styled.albedo_color = Color("#353d4b")
			elif name.contains("shoes"): styled.albedo_color = Color("#23252b")
			elif name.contains("body"):
				styled.albedo_texture = load("res://assets/vit_body_bc.png")
			elif name.contains("skin"):
				styled.albedo_texture = load("res://assets/vit_face_bc.png")
			elif name.contains("iris"): styled.albedo_color = Color("#36505a")
			elif name.contains("sclera"): styled.albedo_color = Color("#e6e1d5")
			else: styled.albedo_color = Color("#aa8875")
			part.set_surface_override_material(i, styled)
	for child in root.get_children(): _style_person(child, outfit)

func _animate(actor: Node3D, name: String) -> void:
	var anim := actor.get_meta("animation", null) as AnimationPlayer
	if anim and anim.current_animation != name: anim.play(name, .2)

func _car(name: String, at: Vector3, yaw: float) -> Node3D:
	var root := CharacterBody3D.new()
	root.collision_layer = 4
	root.collision_mask = 5
	root.floor_snap_length = .3
	add_child(root)
	root.position = at
	root.rotation.y = yaw
	var box := BoxShape3D.new()
	box.size = Vector3(1.8, 1.1, 3.4)
	var collider := CollisionShape3D.new()
	collider.shape = box
	collider.position.y = .7
	root.add_child(collider)
	var model := (load("res://assets/%s.glb" % name) as PackedScene).instantiate()
	root.add_child(model)
	model.scale = Vector3.ONE * 1.65
	model.rotation.y = PI
	return root

func _people() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 3954
	for i in 20:
		var x := (-1.0 if i % 2 else 1.0) * rng.randf_range(16.5, 18.0)
		var z := rng.randf_range(-525, 28)
		var actor := _person(Vector3(x, 0, z), 0)
		crowd.append({"actor":actor, "home":actor.position, "role":i % 4, "offset":rng.randf_range(0, TAU), "speed":rng.randf_range(.6, 1.2)})
	for i in 5:
		var actor := _person(Vector3(26 + i * 6, 0, -1660 - i * 70), PI)
		crowd.append({"actor":actor, "home":actor.position, "role":2, "offset":i * .5, "speed":.5})

func _traffic() -> void:
	for i in 12:
		var lane := -5.4 if i % 2 else 5.4
		var moving := _car("sedan-sports" if i % 3 else "suv-luxury", Vector3(lane, 0, -i * 185.0), 0 if lane < 0 else PI)
		traffic.append({"car":moving, "lane":lane, "speed":11 + i % 4 * 2})
	# Faster local traffic makes the fictional dock district visibly more hazardous.
	for i in 2:
		var route := [Vector3(-173, 0, -317), Vector3(-127, 0, -317), Vector3(-127, 0, -438), Vector3(-173, 0, -438)]
		var index := i * 2
		var moving := _car("sedan-sports", route[index], 0)
		traffic.append({"car":moving, "lane":-173.0, "speed":16.0, "route":route, "route_index":(index + 1) % 4})

func _gates() -> void:
	for z in GATES:
		var gate := Node3D.new()
		add_child(gate)
		gate.position.z = z
		for side in [-1.0, 1.0]:
			_box(gate, Vector3(.5, 7, .5), Vector3(side * 10, 3.5, 0), Color("#5bf0d4"), .2, .2)
		_box(gate, Vector3(20.5, .5, .5), Vector3(0, 7, 0), Color("#5bf0d4"), .2, .2)
		gates.append(gate)
	_show_gates()

func _show_gates() -> void:
	for i in gates.size():
		gates[i].visible = phase == "race" and i >= gate_index and i <= gate_index + 1

func _ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var bar := ColorRect.new()
	bar.color = Color(.025, .055, .085, .83)
	bar.anchor_right = 1
	bar.offset_left = 10
	bar.offset_right = -10
	bar.offset_top = 12
	bar.offset_bottom = 60
	layer.add_child(bar)
	hud = Label.new()
	hud.position = Vector2(24, 25)
	hud.add_theme_font_size_override("font_size", 18)
	layer.add_child(hud)
	caption_bg = ColorRect.new()
	caption_bg.color = Color(.025, .04, .07, .87)
	caption_bg.anchor_top = 1
	caption_bg.anchor_right = 1
	caption_bg.anchor_bottom = 1
	caption_bg.offset_left = 18
	caption_bg.offset_right = -18
	caption_bg.offset_top = -128
	caption_bg.offset_bottom = -18
	layer.add_child(caption_bg)
	caption = Label.new()
	caption.anchor_top = 1
	caption.anchor_right = 1
	caption.anchor_bottom = 1
	caption.offset_left = 36
	caption.offset_right = -36
	caption.offset_top = -111
	caption.offset_bottom = -30
	caption.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	caption.add_theme_font_size_override("font_size", 18)
	layer.add_child(caption)
	var minimap := Control.new()
	minimap.set_script(load("res://scripts/world_minimap.gd"))
	minimap.world = self
	minimap.anchor_left = 1
	minimap.anchor_right = 1
	minimap.offset_left = -194
	minimap.offset_right = -14
	minimap.offset_top = 70
	minimap.offset_bottom = 266
	layer.add_child(minimap)

func _input(event: InputEvent) -> void:
	if _camera_input(event): return
	if not event is InputEventKey or not event.pressed or event.echo: return
	if event.keycode == KEY_R:
		get_tree().reload_current_scene()
		return
	if event.keycode == KEY_M:
		get_tree().change_scene_to_file("res://scenes/heist.tscn")
		return
	if event.keycode != KEY_E: return
	if float(avatar.get_meta("knock_time", 0.0)) > 0: return
	if phase == "win":
		get_tree().change_scene_to_file("res://scenes/heist.tscn")
		return
	if phase == "meet" and avatar.position.distance_to(milo.position) < 5:
		phase = "talk"
		step = 0
	elif phase == "talk":
		step += 1
		if step >= LINES[language].size(): phase = "car"
	elif phase == "car" and avatar.position.distance_to(car.position) < 5:
		phase = "race"
		driving = true
		avatar.visible = false
		milo.visible = false
		(avatar as CharacterBody3D).collision_layer = 0
		(milo as CharacterBody3D).collision_layer = 0
		handling.reset((car as CharacterBody3D).velocity, car.rotation.y)
		_show_gates()
	elif phase == "race" and _car_speed() < 1.5:
		if not driving and avatar.position.distance_to(car.position) >= 4.5: return
		var exit_at := _safe_exit_position() if driving else Vector3.ZERO
		if driving and not exit_at.is_finite(): return
		driving = not driving
		avatar.visible = not driving
		(avatar as CharacterBody3D).collision_layer = 0 if driving else 2
		if driving: handling.reset((car as CharacterBody3D).velocity, car.rotation.y)
		else: avatar.position = exit_at
	_update_ui()

func _safe_exit_position() -> Vector3:
	var capsule := CapsuleShape3D.new()
	capsule.radius = .35
	capsule.height = 1.8
	var query := PhysicsShapeQueryParameters3D.new()
	query.shape = capsule
	query.collision_mask = 7
	query.exclude = [(avatar as CharacterBody3D).get_rid(), (car as CharacterBody3D).get_rid()]
	for offset in [car.global_basis.x * 3, -car.global_basis.x * 3, car.global_basis.z * 3.5, -car.global_basis.z * 3.5]:
		var at: Vector3 = car.position + offset + Vector3.UP * .2
		query.transform = Transform3D(Basis.IDENTITY, at + Vector3.UP * .9)
		if not get_world_3d().direct_space_state.intersect_shape(query, 1).is_empty(): continue
		var ground := PhysicsRayQueryParameters3D.create(at + Vector3.UP, at - Vector3.UP * 3, 1)
		if get_world_3d().direct_space_state.intersect_ray(ground).is_empty(): continue
		return at
	return Vector3.INF

func _car_speed() -> float:
	var motion := (car as CharacterBody3D).velocity
	return Vector2(motion.x, motion.z).length()

func _camera_input(event: InputEvent) -> bool:
	if event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		camera_yaw -= event.relative.x * .004
		camera_orbit_hold = 3.0
		return true
	return false

func _process(delta: float) -> void:
	if camera == null: return
	_day_cycle(delta)
	var focus := car if driving else avatar
	camera.fov = lerpf(camera.fov, 60 + minf(8, absf(velocity) * .62) if driving else 60, minf(1, delta * 2))
	camera_orbit_hold = maxf(0, camera_orbit_hold - delta)
	if driving and camera_orbit_hold <= 0:
		camera_yaw = lerp_angle(camera_yaw, focus.rotation.y, minf(1, delta * 3.5))
	var behind := Vector3(sin(camera_yaw), 0, cos(camera_yaw))
	var desired: Vector3 = focus.position + behind * (10.0 if driving else 5.5) + Vector3(0, 5.0 if driving else 3.0, 0)
	# Keep the follow camera outside solid scenery.
	var aim := focus.position + Vector3.UP * 1.5
	var ray := PhysicsRayQueryParameters3D.create(aim, desired, 1)
	var hit := get_world_3d().direct_space_state.intersect_ray(ray)
	if not hit.is_empty(): desired = hit.position + hit.normal * .4
	camera.position = camera.position.lerp(desired, minf(1, delta * 7))
	camera.look_at(aim)
	_update_ui()

func _physics_process(delta: float) -> void:
	elapsed += delta
	for body in [avatar, car]:
		if body.position.y < -8:
			body.position = Vector3(-8, .3, clampf(body.position.z, -2090, 40))
			(body as CharacterBody3D).velocity = Vector3.ZERO
			velocity = 0
			if body == car: handling.reset()
	_walkers(delta)
	_cars(delta)
	if not driving: _drive_body(car as CharacterBody3D, Vector3.ZERO, delta)
	if phase != "race": _drive_body(milo_car as CharacterBody3D, Vector3.ZERO, delta)
	if milo.visible and not _knocked(milo as CharacterBody3D, delta):
		_person_motion(milo as CharacterBody3D, Vector3.ZERO, delta)
	var knocked := false
	if not driving: knocked = _knocked(avatar as CharacterBody3D, delta)
	if not knocked:
		if phase not in ["talk", "win", "lose"]: _move(delta)
		elif not driving: _person_motion(avatar as CharacterBody3D, Vector3.ZERO, delta)
	if phase == "race":
		time_left = maxf(0, time_left - delta)
		var target := Vector3(5, 0, clampf(car.position.z - 12, -2100, 30))
		var gap := target - milo_car.position
		gap.y = 0
		var motion := gap.normalized() * minf(14.5, gap.length() * 1.2)
		if motion.length() > .2: milo_car.rotation.y = lerp_angle(milo_car.rotation.y, atan2(-motion.x, -motion.z), delta * 2)
		_drive_body(milo_car as CharacterBody3D, motion, delta)
		if driving and gate_index < GATES.size() and absf(car.position.z - GATES[gate_index]) < 12 and absf(car.position.x) < 12:
			gate_index += 1
			_show_gates()
			if gate_index == GATES.size():
				phase = "win"
				_report_score()
		if time_left <= 0 and phase != "win": phase = "lose"

func _move(delta: float) -> void:
	var steer := float(Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT)) - float(Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT))
	var gas := float(Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP)) - float(Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN))
	if driving:
		var state: Dictionary = handling.step(delta, car.rotation.y, gas, steer, Input.is_key_pressed(KEY_SPACE), Input.is_key_pressed(KEY_SHIFT), (car as CharacterBody3D).is_on_floor())
		car.rotation.y = state.yaw
		_drive_body(car as CharacterBody3D, state.velocity, delta)
		handling.feedback((car as CharacterBody3D).velocity)
		velocity = (car as CharacterBody3D).velocity.dot(-car.global_basis.z)
		avatar.position = car.position
	else:
		var direction := Vector3(steer, 0, -gas).normalized().rotated(Vector3.UP, camera_yaw)
		var speed := 4.3 if Input.is_key_pressed(KEY_SHIFT) else 2.3
		_person_motion(avatar as CharacterBody3D, direction * speed, delta)

func _person_motion(actor: CharacterBody3D, motion: Vector3, delta: float) -> void:
	actor.velocity.x = move_toward(actor.velocity.x, motion.x, 16 * delta)
	actor.velocity.z = move_toward(actor.velocity.z, motion.z, 16 * delta)
	actor.velocity.y = -1 if actor.is_on_floor() else actor.velocity.y - 23 * delta
	actor.move_and_slide()
	var planar := Vector3(actor.velocity.x, 0, actor.velocity.z)
	if planar.length() > .1:
		actor.rotation.y = lerp_angle(actor.rotation.y, atan2(-planar.x, -planar.z), minf(1, delta * 12))
	_animate(actor, "Walk" if planar.length() > .15 else "Idle")
	var anim := actor.get_meta("animation", null) as AnimationPlayer
	if anim: anim.speed_scale = clampf(planar.length() / 1.3, .8, 2.3) if planar.length() > .15 else 1.0

func _drive_body(body: CharacterBody3D, motion: Vector3, delta: float) -> void:
	var before := body.position
	var push: Vector3 = body.get_meta("push", Vector3.ZERO)
	# The player controller already retains momentum through feedback. Apply its
	# impulse once; AI bodies overwrite cruise velocity, so their impulse decays.
	body.set_meta("push", Vector3.ZERO if body == car and driving else push.move_toward(Vector3.ZERO, 8 * delta))
	body.velocity = Vector3(motion.x + push.x, body.velocity.y - 23 * delta, motion.z + push.z)
	body.move_and_slide()
	for i in body.get_slide_collision_count():
		var collision := body.get_slide_collision(i)
		var other := collision.get_collider() as CharacterBody3D
		if other != null and other.collision_layer == 4 and motion.length() > 2:
			var direction := -collision.get_normal()
			direction.y = 0
			other.set_meta("push", direction * minf(5, motion.length() * .35))
			body.set_meta("push", -direction * minf(2, motion.length() * .15))
	# Use actual travel so external impulses count, while a blocked car cannot
	# launch pedestrians based on a speed it never reached.
	var travel := (body.position - before) / maxf(delta, .0001)
	travel.y = 0
	if travel.length() > 3:
		_vehicle_impacts(before, body.position, travel)

func _vehicle_impacts(before: Vector3, after: Vector3, motion: Vector3) -> void:
	var actors: Array[Node3D] = [avatar, milo]
	for item in crowd: actors.append(item.actor)
	var a := Vector2(before.x, before.z)
	var b := Vector2(after.x, after.z)
	for node in actors:
		if ((node as CharacterBody3D).collision_layer & 2) == 0 or float(node.get_meta("immune_until", 0.0)) > elapsed: continue
		var point := Vector2(node.position.x, node.position.z)
		var closest := Geometry2D.get_closest_point_to_segment(point, a, b)
		if point.distance_to(closest) > 1.6 or absf(node.position.y - after.y) > 2: continue
		var actor := node as CharacterBody3D
		actor.velocity = motion * .65 + Vector3.UP * clampf(motion.length() * .5, 3, 8)
		actor.set_meta("knock_time", 2.1)
		actor.set_meta("immune_until", elapsed + 5)
		actor.set_meta("landed", false)
		var anim := actor.get_meta("animation", null) as AnimationPlayer
		if anim: anim.pause()

func _knocked(actor: CharacterBody3D, delta: float) -> bool:
	var remaining := float(actor.get_meta("knock_time", 0.0))
	if remaining <= 0: return false
	actor.velocity.y -= 23 * delta
	actor.move_and_slide()
	var visual := actor.get_meta("visual") as Node3D
	visual.rotation.z = lerpf(visual.rotation.z, -PI / 2, minf(1, delta * 7))
	if actor.is_on_floor():
		actor.velocity.x = move_toward(actor.velocity.x, 0, 9 * delta)
		actor.velocity.z = move_toward(actor.velocity.z, 0, 9 * delta)
		if not bool(actor.get_meta("landed")):
			_blood(actor.position)
			actor.set_meta("landed", true)
		remaining -= delta
		actor.set_meta("knock_time", remaining)
		if remaining <= 0:
			visual.rotation = Vector3(0, PI, 0)
			var anim := actor.get_meta("animation", null) as AnimationPlayer
			if anim: anim.play("Idle", .2)
	return true

func _blood(at: Vector3) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = .55
	mesh.bottom_radius = .55
	mesh.height = .008
	mesh.radial_segments = 9
	mesh.material = _mat(Color("#742c30"), .65)
	var stain := MeshInstance3D.new()
	stain.mesh = mesh
	add_child(stain)
	stain.position = Vector3(at.x, .10, at.z)
	stain.scale = Vector3(1.4, 1, .8)
	blood_marks.append(stain)
	if blood_marks.size() > 20: blood_marks.pop_front().queue_free()

func _pedestrian_route(home: Vector3, role: int) -> Array[Vector3]:
	if home.z < -1000:
		return [home + Vector3(0, 0, -16), home + Vector3(0, 0, 16), home]
	var side := -1.0 if home.x < 0 else 1.0
	var crossing: float = CROSSINGS[0]
	for candidate in CROSSINGS:
		if absf(home.z - candidate) < absf(home.z - crossing): crossing = candidate
	var curb := Vector3(side * 17.4, 0, crossing)
	var shop_z := crossing - 37 if crossing > -400 else crossing + 38
	if role % 2 == 0:
		# Visit a shop across the marked crossing, then return by the same safe route.
		return [curb, Vector3(-side * 17.4, 0, crossing), Vector3(-side * 17.4, 0, shop_z), Vector3(-side * 17.4, 0, crossing), curb, home]
	return [Vector3(side * 17.4, 0, shop_z), Vector3(side * 17.4, 0, crossing + 16), home]

func _crossing_clear(z: float) -> bool:
	var vehicles: Array[Node3D] = [car, milo_car]
	for item in traffic: vehicles.append(item.car)
	for node in vehicles:
		var body := node as CharacterBody3D
		if (body.collision_layer & 4) == 0: continue
		if absf(body.position.x) > 12.5: continue
		var gap := z - body.position.z
		if absf(gap) < 3.8: return false
		# Wait for approaching cars; a stopped car behind the stop line is safe.
		if absf(body.velocity.z) > .6 and gap * body.velocity.z > 0:
			if absf(gap / body.velocity.z) < 4.5: return false
	return true

func _routine_open(role: int) -> bool:
	if role == 3: return day_hour >= 18 or day_hour < 2
	return day_hour >= 7 and day_hour < 21

func _walkers(delta: float) -> void:
	for person in crowd:
		var actor := person.actor as CharacterBody3D
		if _knocked(actor, delta): continue
		if not person.has("route"):
			person.route = _pedestrian_route(person.home, person.role)
			person.leg = 0
			person.wait = 0.0
			person.crossing = false
		if person.wait > 0:
			person.wait -= delta
			_person_motion(actor, Vector3.ZERO, delta)
			continue
		if person.leg == 0 and actor.position.distance_to(person.home) < 1 and not _routine_open(person.role):
			_person_motion(actor, Vector3.ZERO, delta)
			continue
		var destination: Vector3 = person.route[person.leg]
		var gap := destination - actor.position
		gap.y = 0
		person.crossing = absf(gap.x) > 1.2 and absf(destination.x) > 12 and absf(destination.z - actor.position.z) < 1.2
		if person.crossing and absf(actor.position.x) >= 12.7 and not _crossing_clear(destination.z):
			_person_motion(actor, Vector3.ZERO, delta)
			continue
		if gap.length() < .6:
			person.crossing = false
			person.leg = (person.leg + 1) % person.route.size()
			# Longer pauses at the shop and at home; no teleporting between routine stops.
			person.wait = (7.0 + person.role * 2) if person.leg in [0, 3] else .35
			_person_motion(actor, Vector3.ZERO, delta)
		else:
			var motion: Vector3 = gap.normalized() * person.speed
			for other in crowd:
				if other.actor == actor: continue
				var away: Vector3 = actor.position - other.actor.position
				away.y = 0
				if away.length_squared() > .01 and away.length_squared() < 1.1:
					motion += away.normalized() * .35
			_person_motion(actor, motion.limit_length(person.speed), delta)

func _traffic_speed(body: CharacterBody3D, heading: Vector3, cruise: float) -> float:
	var allowed := cruise
	var vehicles: Array[Node3D] = [car, milo_car]
	for item in traffic: vehicles.append(item.car)
	for node in vehicles:
		if node == body or not node.visible: continue
		var gap := node.position - body.position
		gap.y = 0
		var ahead := gap.dot(heading)
		var stopping_distance := 7 + cruise * cruise / 16.0
		if absf(gap.cross(heading).y) < 2.4 and ahead > 0 and ahead < stopping_distance:
			var other_speed := maxf(0, (node as CharacterBody3D).velocity.dot(heading))
			allowed = minf(allowed, maxf(0, other_speed + (ahead - 5) * 1.3))
	if absf(body.position.x) < 12.5 and absf(heading.z) > .7:
		for person in crowd:
			if not person.get("crossing", false): continue
			var point: Vector3 = person.actor.position
			if absf(point.x) > 18.5: continue
			var ahead := (point.z - body.position.z) * heading.z
			if ahead > 0 and ahead < 10 + cruise * cruise / 16.0:
				allowed = minf(allowed, maxf(0, (ahead - 7.5) * 1.2))
	return allowed

func _cars(delta: float) -> void:
	for item in traffic:
		var moving := item.car as CharacterBody3D
		var direction: float = item.get("direction", -1.0 if item.lane < 0 else 1.0)
		var heading := Vector3(0, 0, direction)
		if item.has("route"):
			var target: Vector3 = item.route[item.route_index]
			var gap := target - moving.position
			gap.y = 0
			if gap.length() < 4:
				item.route_index = (item.route_index + 1) % item.route.size()
				gap = item.route[item.route_index] - moving.position
				gap.y = 0
			var angle := atan2(-gap.x, -gap.z)
			moving.rotation.y = lerp_angle(moving.rotation.y, angle, minf(1, delta * 2.5))
			heading = -moving.global_basis.z
		var desired := _traffic_speed(moving, heading, item.speed)
		if item.has("route"):
			var to_target: Vector3 = item.route[item.route_index] - moving.position
			desired *= maxf(.3, heading.dot(to_target.normalized()))
		var speed: float = item.get("current_speed", 0.0)
		speed = move_toward(speed, desired, (6.0 if desired > speed else 10.0) * delta)
		item.current_speed = speed
		var motion := heading * speed
		if not item.has("route"): motion.x = (float(item.lane) - moving.position.x) * 1.4
		_drive_body(moving, motion, delta)
		if not item.has("route"):
			var planar := Vector3(moving.velocity.x, 0, moving.velocity.z)
			if planar.length() > .2: moving.rotation.y = lerp_angle(moving.rotation.y, atan2(-planar.x, -planar.z), delta * 3)
			if moving.position.z < -2100: moving.position.z = 42
			if moving.position.z > 45: moving.position.z = -2097

func _update_ui() -> void:
	if hud == null: return
	var c: Array = COPY[language]
	if phase == "meet":
		hud.text = "NEON GETAWAY  |  %s" % AREAS[language][0]
		var missions := {"en":"M: ORIGINAL HEIST MISSIONS", "pt-BR":"M: MISSÕES ORIGINAIS", "es":"M: MISIONES ORIGINALES", "nl":"M: OORSPRONKELIJKE MISSIES"}
		caption.text = c[0] + "\n" + missions[language]
	elif phase == "talk":
		hud.text = "MILO  |  %d / %d" % [step + 1, LINES[language].size()]
		caption.text = LINES[language][step] + "\n" + c[1]
	elif phase == "car":
		hud.text = "NEON GETAWAY  |  PANTHER GT"
		caption.text = c[2]
	elif phase == "race":
		var area: String = AREAS[language][1] if car.position.z > -550 else (AREAS[language][2] if car.position.z > -1450 else AREAS[language][3])
		hud.text = "%s  |  %d / %d  |  %02d:%02d" % [area, gate_index, GATES.size(), int(time_left) / 60, int(time_left) % 60]
		caption.text = c[3] if elapsed < 16 else ""
	elif phase == "win":
		hud.text = c[4]
		caption.text = c[6]
	else:
		hud.text = c[5]
		caption.text = c[5]
	caption.visible = caption.text != ""
	caption_bg.visible = caption.visible

func minimap_objective() -> Vector3:
	if phase == "car": return car.position
	if phase == "race" and gate_index < GATES.size(): return Vector3(0, 0, GATES[gate_index])
	return milo.position

func _report_score() -> void:
	if OS.has_feature("web"):
		var score := mini(1000 + ceili(time_left) * 4, 2000)
		JavaScriptBridge.eval("window.parent.postMessage({source:'neon-getaway',type:'score',score:%d}, window.location.origin)" % score)

func _static_box(parent: Node3D, size: Vector3, at: Vector3) -> void:
	var body := StaticBody3D.new()
	body.collision_layer = 1
	body.collision_mask = 7
	var shape := BoxShape3D.new()
	shape.size = size
	var collider := CollisionShape3D.new()
	collider.shape = shape
	body.add_child(collider)
	parent.add_child(body)
	body.position = at

func _map_rect(at: Vector3, size: Vector3, tint: Color) -> void:
	map_features.append({"rect":Rect2(Vector2(at.x - size.x / 2, at.z - size.z / 2), Vector2(size.x, size.z)), "color":tint})

func _solid_visual(size: Vector3, at: Vector3, tint: Color) -> void:
	_box(self, size, at, tint)
	_static_box(self, size, at)
	_map_rect(at, size, Color("#ac9c89"))

func _sign(at: Vector3, words: String, tint: Color) -> void:
	var sign := Label3D.new()
	sign.text = words
	sign.font_size = 54
	sign.pixel_size = .014
	sign.modulate = tint
	sign.outline_modulate = Color("#162632")
	sign.outline_size = 12
	sign.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	sign.visibility_range_end = 145
	add_child(sign)
	sign.position = at

func _dense_districts() -> void:
	# Shop blocks sit in the spaces between the existing city streets.
	var shop_names := ["SUNSET COFFEE", "TIDAL SURF", "PALM DELI", "NIGHT OWL", "AUTO PARTS", "RECORD STORE"]
	for i in 6:
		var side := -1.0 if i % 2 else 1.0
		var pos := Vector3(side * 32, 3, -102 - floori(i / 2.0) * 125)
		_solid_visual(Vector3(25, 6, 19), pos, Color("#8bafa5") if side > 0 else Color("#bb8d76"))
		_box(self, Vector3(26, .35, 20), pos + Vector3(0, 3.2, 0), Color("#59656b"))
		_box(self, Vector3(.15, 2.7, 13), pos + Vector3(-side * 12.55, -.4, 0), Color("#315c6b"), .18, .2)
		_box(self, Vector3(3, .25, 18), pos + Vector3(-side * 13, 1.2, 0), Color("#d3af6d"))
		_sign(pos + Vector3(-side * 12.7, 2.5, 0), shop_names[i], Color("#ffedb5"))
	# Supermarket with a parking apron and trolley bay.
	_box(self, Vector3(49, .08, 44), Vector3(-96, .01, -226), Color("#626767"))
	_solid_visual(Vector3(32, 7, 21), Vector3(-96, 3.5, -235), Color("#8aa79e"))
	_sign(Vector3(-96, 6, -223), "COAST MARKET", Color("#d8f5bf"))
	for x in range(-116, -76, 6):
		_box(self, Vector3(.13, .04, 6), Vector3(x, .08, -209), Color("#e5d9bc"))
	# Petrol station: shop, canopy, pumps and bollards are solid geometry.
	_box(self, Vector3(47, .08, 48), Vector3(93, .01, -103), Color("#888b82"))
	_solid_visual(Vector3(22, 5, 10), Vector3(93, 2.5, -120), Color("#aca790"))
	_solid_visual(Vector3(30, .65, 19), Vector3(93, 5.5, -94), Color("#60a2aa"))
	_sign(Vector3(93, 6.5, -84), "COAST FUEL", Color("#ffedaa"))
	for x in [83.0, 103.0]:
		_solid_visual(Vector3(.4, 5.3, .4), Vector3(x, 2.65, -99), Color("#565e60"))
		_solid_visual(Vector3(1.1, 1.8, 1.3), Vector3(x, .9, -92), Color("#ca7866"))
		for z in [-90.5, -93.5]:
			_solid_visual(Vector3(.22, .8, .22), Vector3(x + 1, .4, z), Color("#d6bd58"))
	# Residential streets and the fictional, rougher western dock neighborhood.
	for side in [-1.0, 1.0]:
		var road_pos := Vector3(side * 176, .04, -252)
		_box(self, Vector3(12, .05, 487), road_pos, Color("#535c5e"))
		_map_rect(road_pos, Vector3(12, 0, 487), Color("#40494d"))
		for z in [-315.0, -440.0]:
			_box(self, Vector3(64, .05, 16), Vector3(side * 155, .045, z), Color("#535c5e"))
			_map_rect(Vector3(side * 155, 0, z), Vector3(64, 0, 16), Color("#40494d"))
		for row in 7:
			var p := Vector3(side * 201, 2.3, -42 - row * 66)
			var tint := Color("#c6b194") if side > 0 else Color("#a38879")
			_solid_visual(Vector3(15, 4.6, 17), p, tint)
			_box(self, Vector3(17, .8, 19), p + Vector3(0, 2.7, 0), Color("#805c50"))
			_box(self, Vector3(.1, 1.5, 5), p + Vector3(-side * 7.56, .25, 0), Color("#456571"))
			_box(self, Vector3(10, .04, 2), p + Vector3(-side * 11.5, -2.27, 0), Color("#baad96"))
	_sign(Vector3(-173, 5, -333), "RUST QUAY", Color("#e29678"))
	_sign(Vector3(172, 5, -120), "PALM GARDENS", Color("#e3f0c9"))
	for z in range(18, -520, -36):
		for side in [-1.0, 1.0]:
			_static_box(self, Vector3(.25, 5.5, .25), Vector3(side * 15.5, 2.75, z))
			_box(self, Vector3(.2, 5.5, .2), Vector3(side * 15.5, 2.75, z), Color("#576368"))
			_box(self, Vector3(2.3, .15, .2), Vector3(side * 14.5, 5.5, z), Color("#576368"))
			var bulb := _box(self, Vector3(.9, .1, .45), Vector3(side * 13.8, 5.35, z), Color("#ebd8a4"))
			var glow := _mat(Color("#f1dfb4"))
			glow.emission_enabled = true
			glow.emission = Color("#eac382")
			bulb.material_override = glow
			street_lamps.append(bulb)
			if z % 72 == 18:
				_solid_visual(Vector3(2.3, .45, .8), Vector3(side * 19, .5, z + 7), Color("#77614b"))

func _batch_static_geometry() -> void:
	# Merge the many unique box/window shapes by shared material and local tile.
	# A mesh-RID batch still needed one draw for every different box size.
	var groups: Dictionary = {}
	for part in static_meshes:
		if part.material_override != null or part.get_surface_override_material(0) != null: continue
		var material := part.mesh.surface_get_material(0)
		var pos := part.global_position
		var key := "%s:%d:%d" % [material.get_rid().get_id(), floori(pos.x / 150), floori(pos.z / 150)]
		if not groups.has(key):
			var surface := SurfaceTool.new()
			surface.begin(Mesh.PRIMITIVE_TRIANGLES)
			groups[key] = {"surface":surface, "material":material}
		groups[key].surface.append_from(part.mesh, 0, part.global_transform)
		part.queue_free()
	for group in groups.values():
		var mesh := MeshInstance3D.new()
		mesh.mesh = group.surface.commit()
		mesh.mesh.surface_set_material(0, group.material)
		add_child(mesh)
	static_meshes.clear()

func _day_cycle(delta: float = 1.0) -> void:
	# Sky color edits rebuild its lighting map; a 16-minute cycle needs only 2Hz.
	sky_refresh += delta
	if sky_refresh < .5: return
	sky_refresh = 0.0
	day_hour = fmod(9.5 + elapsed / 40.0, 24.0)
	var angle := (day_hour - 6) / 24 * TAU
	var daylight := clampf(sin(angle) * 1.3, 0, 1)
	sun.rotation_degrees.x = -rad_to_deg(angle)
	sun.light_energy = .72 * daylight
	sun.light_color = Color("#ffb87d").lerp(Color("#fff5df"), daylight)
	environment.ambient_light_energy = .16 + daylight * .28
	sky_material.sky_top_color = Color("#071321").lerp(Color("#3986b5"), daylight)
	sky_material.sky_horizon_color = Color("#243044").lerp(Color("#bdd0db"), daylight)
	sky_material.ground_horizon_color = sky_material.sky_horizon_color
	for bulb in street_lamps:
		(bulb.material_override as StandardMaterial3D).emission_energy_multiplier = 1.8 * (1 - daylight)
