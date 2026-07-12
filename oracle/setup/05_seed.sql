ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = BG_OWNER;

-- ============================================================
-- BiblioGuest - Script de Carga de Datos (ACTUALIZADO)
-- ============================================================
-- NOTA:
-- - Este script asume BD vacía (solo con el schema creado).
-- - Usa variables de SQL*Plus/SQLcl (VAR / :var).
-- - Respeta todas las FK y constraints del schema actual.
-- ============================================================

-- 1) ÁREAS
VAR v_area_ing   NUMBER
VAR v_area_hum   NUMBER
VAR v_area_salud NUMBER
VAR v_area_econ  NUMBER

INSERT INTO Areas (nombre_area) VALUES ('Ingeniería')
  RETURNING id_area INTO :v_area_ing;

INSERT INTO Areas (nombre_area) VALUES ('Humanidades')
  RETURNING id_area INTO :v_area_hum;

INSERT INTO Areas (nombre_area) VALUES ('Ciencias de la Salud')
  RETURNING id_area INTO :v_area_salud;

INSERT INTO Areas (nombre_area) VALUES ('Económicas y Empresariales')
  RETURNING id_area INTO :v_area_econ;

-- 2) NORMAS
VAR v_norma_std    NUMBER
VAR v_norma_strict NUMBER
VAR v_norma_flex   NUMBER

INSERT INTO NormasBiblioteca (dias_prestamo_libros, dias_anticipacion_libros, dias_anticipacion_cubiculos, dias_anticipacion_laptops)
VALUES (5, 2, 7, 1)
RETURNING id_normas_biblioteca INTO :v_norma_std;

INSERT INTO NormasBiblioteca (dias_prestamo_libros, dias_anticipacion_libros, dias_anticipacion_cubiculos, dias_anticipacion_laptops)
VALUES (3, 1, 5, 1)
RETURNING id_normas_biblioteca INTO :v_norma_strict;

INSERT INTO NormasBiblioteca (dias_prestamo_libros, dias_anticipacion_libros, dias_anticipacion_cubiculos, dias_anticipacion_laptops)
VALUES (7, 3, 10, 2)
RETURNING id_normas_biblioteca INTO :v_norma_flex;

-- 3) UNIDADES ACADÉMICAS
VAR v_unmsm        NUMBER
VAR v_fisi         NUMBER
VAR v_flch         NUMBER
VAR v_fmed         NUMBER
VAR v_fecon        NUMBER
VAR v_epi          NUMBER
VAR v_centro_fisi  NUMBER

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Universidad Nacional Mayor de San Marcos', 'Universidad', NULL, NULL)
RETURNING id_unidad INTO :v_unmsm;

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Facultad de Ingeniería de Sistemas e Informática', 'Facultad', :v_area_ing, :v_unmsm)
RETURNING id_unidad INTO :v_fisi;

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Facultad de Letras y Ciencias Humanas', 'Facultad', :v_area_hum, :v_unmsm)
RETURNING id_unidad INTO :v_flch;

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Facultad de Medicina', 'Facultad', :v_area_salud, :v_unmsm)
RETURNING id_unidad INTO :v_fmed;

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Facultad de Ciencias Económicas', 'Facultad', :v_area_econ, :v_unmsm)
RETURNING id_unidad INTO :v_fecon;

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Escuela Profesional de Ingeniería de Software', 'Escuela', :v_area_ing, :v_fisi)
RETURNING id_unidad INTO :v_epi;

INSERT INTO UnidadAcademica (nombre, tipo, id_area, id_padre)
VALUES ('Centro de Investigación en Computación', 'CentroInvestigacion', :v_area_ing, :v_fisi)
RETURNING id_unidad INTO :v_centro_fisi;

-- 4) BIBLIOTECAS
VAR v_biblio_central NUMBER
VAR v_biblio_fisi    NUMBER
VAR v_biblio_med     NUMBER
VAR v_biblio_econ    NUMBER

INSERT INTO Biblioteca (id_normas_biblioteca, nombre, id_unidad)
VALUES (:v_norma_std, 'Biblioteca Central', :v_unmsm)
RETURNING id_biblioteca INTO :v_biblio_central;

INSERT INTO Biblioteca (id_normas_biblioteca, nombre, id_unidad)
VALUES (:v_norma_std, 'Biblioteca FISI', :v_fisi)
RETURNING id_biblioteca INTO :v_biblio_fisi;

INSERT INTO Biblioteca (id_normas_biblioteca, nombre, id_unidad)
VALUES (:v_norma_strict, 'Biblioteca Medicina', :v_fmed)
RETURNING id_biblioteca INTO :v_biblio_med;

INSERT INTO Biblioteca (id_normas_biblioteca, nombre, id_unidad)
VALUES (:v_norma_flex, 'Biblioteca Economía', :v_fecon)
RETURNING id_biblioteca INTO :v_biblio_econ;

-- 5) CONTACTOS + VÍNCULOS
VAR v_cto_central_email  NUMBER
VAR v_cto_central_fono   NUMBER
VAR v_cto_central_ws     NUMBER
VAR v_cto_fisi_email     NUMBER
VAR v_cto_med_email      NUMBER
VAR v_cto_econ_email     NUMBER

INSERT INTO Contacto (tipo_contacto, valor_contacto) VALUES ('Email', 'central@unmsm.edu.pe')
  RETURNING id_contacto INTO :v_cto_central_email;
INSERT INTO Contacto (tipo_contacto, valor_contacto) VALUES ('Telefono', '+51 1 619-7000')
  RETURNING id_contacto INTO :v_cto_central_fono;
INSERT INTO Contacto (tipo_contacto, valor_contacto) VALUES ('Whatsapp', '+51 999 888 777')
  RETURNING id_contacto INTO :v_cto_central_ws;
INSERT INTO Contacto (tipo_contacto, valor_contacto) VALUES ('Email', 'fisi@unmsm.edu.pe')
  RETURNING id_contacto INTO :v_cto_fisi_email;
INSERT INTO Contacto (tipo_contacto, valor_contacto) VALUES ('Email', 'bibliomed@unmsm.edu.pe')
  RETURNING id_contacto INTO :v_cto_med_email;
INSERT INTO Contacto (tipo_contacto, valor_contacto) VALUES ('Email', 'biblioeco@unmsm.edu.pe')
  RETURNING id_contacto INTO :v_cto_econ_email;

-- BibliotecaContacto
INSERT INTO BibliotecaContacto (id_biblioteca, id_contacto) VALUES (:v_biblio_central, :v_cto_central_email);
INSERT INTO BibliotecaContacto (id_biblioteca, id_contacto) VALUES (:v_biblio_central, :v_cto_central_fono);
INSERT INTO BibliotecaContacto (id_biblioteca, id_contacto) VALUES (:v_biblio_central, :v_cto_central_ws);
INSERT INTO BibliotecaContacto (id_biblioteca, id_contacto) VALUES (:v_biblio_fisi,    :v_cto_fisi_email);
INSERT INTO BibliotecaContacto (id_biblioteca, id_contacto) VALUES (:v_biblio_med,     :v_cto_med_email);
INSERT INTO BibliotecaContacto (id_biblioteca, id_contacto) VALUES (:v_biblio_econ,    :v_cto_econ_email);

-- UnidadContacto
INSERT INTO UnidadContacto (id_unidad, id_contacto) VALUES (:v_fisi, :v_cto_fisi_email);
INSERT INTO UnidadContacto (id_unidad, id_contacto) VALUES (:v_fmed, :v_cto_med_email);
INSERT INTO UnidadContacto (id_unidad, id_contacto) VALUES (:v_fecon, :v_cto_econ_email);

-- 6) GRUPOS DE USUARIOS
VAR v_grupo1 NUMBER
VAR v_grupo2 NUMBER
VAR v_grupo3 NUMBER

INSERT INTO GrupoUsuarios (id_grupo_usuarios) VALUES (DEFAULT)
RETURNING id_grupo_usuarios INTO :v_grupo1;

INSERT INTO GrupoUsuarios (id_grupo_usuarios) VALUES (DEFAULT)
RETURNING id_grupo_usuarios INTO :v_grupo2;

INSERT INTO GrupoUsuarios (id_grupo_usuarios) VALUES (DEFAULT)
RETURNING id_grupo_usuarios INTO :v_grupo3;

-- 7) USUARIOS (con password_hash para login - contraseña: 123)
-- Hash bcrypt para "123": $2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse
VAR v_user_mihael   NUMBER
VAR v_user_ricardo  NUMBER
VAR v_user_maye     NUMBER
VAR v_user_johan    NUMBER
VAR v_user_miguel   NUMBER
VAR v_user_fabrizio NUMBER
VAR v_user_kevin    NUMBER
VAR v_user_luisa    NUMBER
VAR v_user_andrea   NUMBER

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Mihael Cristobal', 'estudiante', 'mihael@unmsm.edu.pe', 'activo', :v_fisi, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_mihael;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Ricardo Matamoros', '20205678', 'ricardo@unmsm.edu.pe', 'activo', :v_fisi, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_ricardo;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Maye Delgado', '20207890', 'maye@unmsm.edu.pe', 'activo', :v_flch, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_maye;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Johan Torres', '20204567', 'johan@unmsm.edu.pe', 'activo', :v_fisi, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_johan;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Miguel Solis', '20203456', 'miguel@unmsm.edu.pe', 'activo', :v_epi, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_miguel;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Fabrizio Ramos', '20206789', 'fabrizio@unmsm.edu.pe', 'activo', :v_fecon, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_fabrizio;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Kevin Soto', '20208901', 'kevin@unmsm.edu.pe', 'bloqueado', :v_fisi, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_kevin;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Luisa Pérez', '20209012', 'luisa@unmsm.edu.pe', 'activo', :v_fmed, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_luisa;

INSERT INTO Usuario (nombre, codigo_institucional, correo, estado, id_unidad, password_hash)
VALUES ('Andrea Ruiz', '20204321', 'andrea@unmsm.edu.pe', 'activo', :v_flch, '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_usuario INTO :v_user_andrea;

-- 8) USUARIO-GRUPO (invitaciones / estados miembro)
-- Grupo 1: Mihael (aceptado), Ricardo (aceptado), Johan (pendiente)
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_mihael,  :v_grupo1, 'aceptado');
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_ricardo, :v_grupo1, 'aceptado');
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_johan,   :v_grupo1, 'pendiente');

-- Grupo 2: Miguel (aceptado), Fabrizio (aceptado), Kevin (rechazado)
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_miguel,   :v_grupo2, 'aceptado');
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_fabrizio, :v_grupo2, 'aceptado');
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_kevin,    :v_grupo2, 'rechazado');

-- Grupo 3: Luisa (pendiente), Andrea (pendiente), Maye (pendiente)
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_luisa, :v_grupo3, 'pendiente');
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_andrea, :v_grupo3, 'pendiente');
INSERT INTO UsuarioGrupoUsuarios (id_usuario, id_grupo_usuarios, estado_miembro)
VALUES (:v_user_maye, :v_grupo3, 'pendiente');

-- 9) BIBLIOTECARIOS (con password_hash - contraseña: 123)
VAR v_bib_ana    NUMBER
VAR v_bib_luis   NUMBER
VAR v_bib_carlos NUMBER
VAR v_bib_maria  NUMBER

INSERT INTO Bibliotecario (nombre, correo, turno, password_hash)
VALUES ('Ana Pérez', 'biblio', 'Mañana', '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_bibliotecario INTO :v_bib_ana;

INSERT INTO Bibliotecario (nombre, correo, turno, password_hash)
VALUES ('Luis Rojas', 'luis.rojas@unmsm.edu.pe', 'Tarde', '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_bibliotecario INTO :v_bib_luis;

INSERT INTO Bibliotecario (nombre, correo, turno, password_hash)
VALUES ('Carlos Vega', 'carlos.vega@unmsm.edu.pe', 'Noche', '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_bibliotecario INTO :v_bib_carlos;

INSERT INTO Bibliotecario (nombre, correo, turno, password_hash)
VALUES ('María López', 'maria.lopez@unmsm.edu.pe', 'Mañana', '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_bibliotecario INTO :v_bib_maria;

-- 9.1) ADMINISTRADOR DE PRUEBA (contraseña: 123)
VAR v_admin_test NUMBER

INSERT INTO Administrador (nombre, correo, password_hash)
VALUES ('Admin Test', 'admin', '$2a$10$HjSPaZaqCuhmuN0OtgM8Vu4uZZRTIL2cJo70XfBqYimeEu.EXgJse')
RETURNING id_administrador INTO :v_admin_test;

-- 10) CATEGORÍAS y ETIQUETAS
VAR v_cat_cs      NUMBER
VAR v_cat_bd      NUMBER
VAR v_cat_redes   NUMBER
VAR v_cat_ia      NUMBER
VAR v_cat_mate    NUMBER

VAR v_tag_unmsm   NUMBER
VAR v_tag_invest  NUMBER
VAR v_tag_bests   NUMBER
VAR v_tag_nuevo   NUMBER
VAR v_tag_ref     NUMBER

INSERT INTO Categorias (nombre, descripcion) VALUES ('Ciencia de la Computación', 'Libros de CS/IT')
  RETURNING id_categoria INTO :v_cat_cs;
INSERT INTO Categorias (nombre, descripcion) VALUES ('Base de Datos', 'Teoría y práctica de BD')
  RETURNING id_categoria INTO :v_cat_bd;
INSERT INTO Categorias (nombre, descripcion) VALUES ('Redes', 'Redes de computadoras y comunicaciones')
  RETURNING id_categoria INTO :v_cat_redes;
INSERT INTO Categorias (nombre, descripcion) VALUES ('Inteligencia Artificial', 'IA, ML y temas relacionados')
  RETURNING id_categoria INTO :v_cat_ia;
INSERT INTO Categorias (nombre, descripcion) VALUES ('Matemáticas', 'Álgebra, cálculo, probabilidad')
  RETURNING id_categoria INTO :v_cat_mate;

INSERT INTO Etiquetas (nombre, descripcion) VALUES ('UNMSM', 'Colección UNMSM')
  RETURNING id_etiqueta INTO :v_tag_unmsm;
INSERT INTO Etiquetas (nombre, descripcion) VALUES ('Investigación', 'Material de investigación')
  RETURNING id_etiqueta INTO :v_tag_invest;
INSERT INTO Etiquetas (nombre, descripcion) VALUES ('BestSeller', 'Muy solicitado por los usuarios')
  RETURNING id_etiqueta INTO :v_tag_bests;
INSERT INTO Etiquetas (nombre, descripcion) VALUES ('NuevoIngreso', 'Material ingresado recientemente')
  RETURNING id_etiqueta INTO :v_tag_nuevo;
INSERT INTO Etiquetas (nombre, descripcion) VALUES ('Referencia', 'Solo consulta en sala')
  RETURNING id_etiqueta INTO :v_tag_ref;

-- 11) LIBROS, AUTORES, RELACIONES, EJEMPLARES
VAR v_libro_db     NUMBER
VAR v_libro_cc     NUMBER
VAR v_libro_alg    NUMBER
VAR v_libro_dp     NUMBER
VAR v_libro_ai     NUMBER
VAR v_libro_os     NUMBER
VAR v_libro_redes  NUMBER
VAR v_libro_io     NUMBER

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780073523323', 'Database System Concepts', NULL, 'McGraw-Hill', 6, 2010)
RETURNING id_libro INTO :v_libro_db;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780132350884', 'Clean Code', 'A Handbook of Agile Software Craftsmanship', 'Prentice Hall', 1, 2008)
RETURNING id_libro INTO :v_libro_cc;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780262033848', 'Introduction to Algorithms', NULL, 'MIT Press', 3, 2009)
RETURNING id_libro INTO :v_libro_alg;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780201633610', 'Design Patterns', 'Elements of Reusable Object-Oriented Software', 'Addison-Wesley', 1, 1994)
RETURNING id_libro INTO :v_libro_dp;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780136042594', 'Artificial Intelligence', 'A Modern Approach', 'Pearson', 3, 2010)
RETURNING id_libro INTO :v_libro_ai;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780470128725', 'Operating System Concepts', NULL, 'Wiley', 8, 2008)
RETURNING id_libro INTO :v_libro_os;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780132126953', 'Computer Networks', NULL, 'Pearson', 5, 2010)
RETURNING id_libro INTO :v_libro_redes;

INSERT INTO Libro (isbn, titulo, subtitulo, editorial, nro_edicion, anio)
VALUES ('9780073381527', 'Introduction to Operations Research', NULL, 'McGraw-Hill', 9, 2010)
RETURNING id_libro INTO :v_libro_io;

-- AUTORES
VAR v_autor_silb   NUMBER
VAR v_autor_korth  NUMBER
VAR v_autor_sudar  NUMBER
VAR v_autor_uncle  NUMBER
VAR v_autor_cormen NUMBER
VAR v_autor_leis   NUMBER
VAR v_autor_rivest NUMBER
VAR v_autor_stein  NUMBER
VAR v_autor_gamma  NUMBER
VAR v_autor_helm   NUMBER
VAR v_autor_john   NUMBER
VAR v_autor_vlis   NUMBER
VAR v_autor_russ   NUMBER
VAR v_autor_norvig NUMBER
VAR v_autor_tanen  NUMBER
VAR v_autor_hiller NUMBER

INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Abraham', 'Silberschatz', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_silb;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Henry F.', 'Korth', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_korth;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('S.', 'Sudarshan', 'India')
  RETURNING id_autor INTO :v_autor_sudar;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Robert C.', 'Martin', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_uncle;

INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Thomas H.', 'Cormen', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_cormen;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Charles E.', 'Leiserson', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_leis;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Ronald L.', 'Rivest', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_rivest;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Clifford', 'Stein', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_stein;

INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Erich', 'Gamma', 'Suiza')
  RETURNING id_autor INTO :v_autor_gamma;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Richard', 'Helm', 'Australia')
  RETURNING id_autor INTO :v_autor_helm;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Ralph', 'Johnson', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_john;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('John', 'Vlissides', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_vlis;

INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Stuart', 'Russell', 'Reino Unido')
  RETURNING id_autor INTO :v_autor_russ;
INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Peter', 'Norvig', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_norvig;

INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Andrew', 'Tanenbaum', 'Países Bajos')
  RETURNING id_autor INTO :v_autor_tanen;

INSERT INTO Autor (nombre, apellido, nacionalidad) VALUES ('Frederick S.', 'Hiller', 'EE.UU.')
  RETURNING id_autor INTO :v_autor_hiller;

-- LibroAutor
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_db,    :v_autor_silb);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_db,    :v_autor_korth);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_db,    :v_autor_sudar);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_cc,    :v_autor_uncle);

INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_alg,   :v_autor_cormen);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_alg,   :v_autor_leis);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_alg,   :v_autor_rivest);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_alg,   :v_autor_stein);

INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_dp,    :v_autor_gamma);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_dp,    :v_autor_helm);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_dp,    :v_autor_john);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_dp,    :v_autor_vlis);

INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_ai,    :v_autor_russ);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_ai,    :v_autor_norvig);

INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_os,    :v_autor_silb);  -- mismo autor que DB
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_redes, :v_autor_tanen);
INSERT INTO LibroAutor (id_libro, id_autor) VALUES (:v_libro_io,    :v_autor_hiller);

-- CategoriasLibro
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_bd,   :v_libro_db);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_cs,   :v_libro_cc);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_cs,   :v_libro_alg);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_cs,   :v_libro_dp);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_ia,   :v_libro_ai);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_cs,   :v_libro_os);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_redes,:v_libro_redes);
INSERT INTO CategoriasLibro (id_categoria, id_libro) VALUES (:v_cat_mate, :v_libro_io);

-- LibroEtiquetas
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_db,    :v_tag_invest);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_cc,    :v_tag_unmsm);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_cc,    :v_tag_bests);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_alg,   :v_tag_ref);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_dp,    :v_tag_bests);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_ai,    :v_tag_invest);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_os,    :v_tag_unmsm);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_redes, :v_tag_nuevo);
INSERT INTO LibroEtiquetas (id_libro, id_etiqueta) VALUES (:v_libro_io,    :v_tag_nuevo);

-- EJEMPLARES
VAR v_ej_db1    NUMBER
VAR v_ej_db2    NUMBER
VAR v_ej_cc1    NUMBER
VAR v_ej_alg1   NUMBER
VAR v_ej_alg2   NUMBER
VAR v_ej_dp1    NUMBER
VAR v_ej_ai1    NUMBER
VAR v_ej_os1    NUMBER
VAR v_ej_red1   NUMBER
VAR v_ej_red2   NUMBER
VAR v_ej_io1    NUMBER

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_db, 'BC-DB-0001', 'disponible', :v_biblio_central)
RETURNING id_ejemplar INTO :v_ej_db1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_db, 'BC-DB-0002', 'disponible', :v_biblio_central)
RETURNING id_ejemplar INTO :v_ej_db2;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_cc, 'FISI-CC-0001', 'disponible', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_cc1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_alg, 'FISI-ALG-0001', 'disponible', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_alg1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_alg, 'FISI-ALG-0002', 'deteriorado', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_alg2;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_dp, 'FISI-DP-0001', 'disponible', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_dp1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_ai, 'CENT-AI-0001', 'disponible', :v_biblio_central)
RETURNING id_ejemplar INTO :v_ej_ai1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_os, 'FISI-OS-0001', 'disponible', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_os1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_redes, 'FISI-RED-0001', 'disponible', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_red1;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_redes, 'FISI-RED-0002', 'prestado', :v_biblio_fisi)
RETURNING id_ejemplar INTO :v_ej_red2;

INSERT INTO Ejemplar (id_libro, codigo_barra, estado, id_biblioteca)
VALUES (:v_libro_io, 'ECO-IO-0001', 'disponible', :v_biblio_econ)
RETURNING id_ejemplar INTO :v_ej_io1;

-- 12) UTILIDADES y LAPTOPS
VAR v_util_clases NUMBER
VAR v_util_invest NUMBER
VAR v_util_lab    NUMBER
VAR v_util_post   NUMBER

VAR v_lap_sn1     NUMBER
VAR v_lap_sn2     NUMBER
VAR v_lap_sn3     NUMBER
VAR v_lap_sn4     NUMBER
VAR v_lap_sn5     NUMBER
VAR v_lap_sn6     NUMBER

INSERT INTO Utilidad (nombre_utilidad) VALUES ('Clases')
  RETURNING id_utilidad INTO :v_util_clases;
INSERT INTO Utilidad (nombre_utilidad) VALUES ('Investigación')
  RETURNING id_utilidad INTO :v_util_invest;
INSERT INTO Utilidad (nombre_utilidad) VALUES ('Laboratorio')
  RETURNING id_utilidad INTO :v_util_lab;
INSERT INTO Utilidad (nombre_utilidad) VALUES ('Postgrado')
  RETURNING id_utilidad INTO :v_util_post;

INSERT INTO Laptop (id_biblioteca, numero_serie, sistema_operativo, marca, modelo, id_utilidad, estado)
VALUES (:v_biblio_central, 'SN-001', 'Windows 11', 'Dell',   'Latitude 5420', :v_util_clases, 'disponible')
RETURNING id_laptop INTO :v_lap_sn1;

INSERT INTO Laptop (id_biblioteca, numero_serie, sistema_operativo, marca, modelo, id_utilidad, estado)
VALUES (:v_biblio_fisi,    'SN-002', 'Ubuntu 22.04', 'Lenovo', 'ThinkPad X1', :v_util_invest, 'disponible')
RETURNING id_laptop INTO :v_lap_sn2;

INSERT INTO Laptop (id_biblioteca, numero_serie, sistema_operativo, marca, modelo, id_utilidad, estado)
VALUES (:v_biblio_fisi,    'SN-003', 'Windows 10',  'HP',    'ProBook 450', :v_util_clases, 'en uso')
RETURNING id_laptop INTO :v_lap_sn3;

INSERT INTO Laptop (id_biblioteca, numero_serie, sistema_operativo, marca, modelo, id_utilidad, estado)
VALUES (:v_biblio_med,     'SN-004', 'Windows 11',  'Dell',  'Inspiron 3501', :v_util_lab, 'disponible')
RETURNING id_laptop INTO :v_lap_sn4;

INSERT INTO Laptop (id_biblioteca, numero_serie, sistema_operativo, marca, modelo, id_utilidad, estado)
VALUES (:v_biblio_econ,    'SN-005', 'Windows 10',  'Acer',  'Aspire 5', :v_util_post, 'disponible')
RETURNING id_laptop INTO :v_lap_sn5;

INSERT INTO Laptop (id_biblioteca, numero_serie, sistema_operativo, marca, modelo, id_utilidad, estado)
VALUES (:v_biblio_central, 'SN-006', 'Ubuntu 22.04', 'Lenovo', 'ThinkPad T14', :v_util_invest, 'baja')
RETURNING id_laptop INTO :v_lap_sn6;

-- 13) CUBÍCULOS
VAR v_cub1 NUMBER
VAR v_cub2 NUMBER
VAR v_cub3 NUMBER
VAR v_cub4 NUMBER
VAR v_cub5 NUMBER

INSERT INTO Cubiculo (capacidad, id_biblioteca, estado)
VALUES (4, :v_biblio_central, 'disponible')
RETURNING id_cubiculo INTO :v_cub1;

INSERT INTO Cubiculo (capacidad, id_biblioteca, estado)
VALUES (6, :v_biblio_central, 'disponible')
RETURNING id_cubiculo INTO :v_cub2;

INSERT INTO Cubiculo (capacidad, id_biblioteca, estado)
VALUES (8, :v_biblio_fisi, 'ocupado')
RETURNING id_cubiculo INTO :v_cub3;

INSERT INTO Cubiculo (capacidad, id_biblioteca, estado)
VALUES (3, :v_biblio_med, 'mantenimiento')
RETURNING id_cubiculo INTO :v_cub4;

INSERT INTO Cubiculo (capacidad, id_biblioteca, estado)
VALUES (5, :v_biblio_econ, 'disponible')
RETURNING id_cubiculo INTO :v_cub5;

-- 14) PRÉSTAMOS DE LIBROS (datos de prueba)
VAR v_prestamo1 NUMBER
VAR v_prestamo2 NUMBER
VAR v_prestamo3 NUMBER

-- Préstamo atrasado (ejemplar de Clean Code)
INSERT INTO PrestamoLibro (id_usuario, id_bibliotecario, id_ejemplar, fecha_solicitud, fecha_inicio, fecha_fin, fecha_devolucion_real, estado)
VALUES (:v_user_mihael, :v_bib_ana, :v_ej_cc1,
        SYSTIMESTAMP, DATE '2025-11-03', DATE '2025-11-08', NULL, 'activo')
RETURNING id_prestamo INTO :v_prestamo1;

-- Préstamo finalizado (ejemplar de Database)
INSERT INTO PrestamoLibro (id_usuario, id_bibliotecario, id_ejemplar, fecha_solicitud, fecha_inicio, fecha_fin, fecha_devolucion_real, estado)
VALUES (:v_user_ricardo, :v_bib_luis, :v_ej_db1,
        SYSTIMESTAMP, DATE '2025-10-01', DATE '2025-10-05', DATE '2025-10-04', 'finalizado')
RETURNING id_prestamo INTO :v_prestamo2;

-- Préstamo activo (ejemplar de AI)
INSERT INTO PrestamoLibro (id_usuario, id_bibliotecario, id_ejemplar, fecha_solicitud, fecha_inicio, fecha_fin, fecha_devolucion_real, estado)
VALUES (:v_user_miguel, :v_bib_maria, :v_ej_ai1,
        SYSTIMESTAMP, TRUNC(SYSDATE), TRUNC(SYSDATE) + 5, NULL, 'activo')
RETURNING id_prestamo INTO :v_prestamo3;

-- 15) RESERVAS DE LAPTOP
VAR v_res_lap1 NUMBER
VAR v_res_lap2 NUMBER
VAR v_res_lap3 NUMBER

-- Reserva activa en Biblioteca Central
INSERT INTO ReservaLaptop (id_usuario, id_bibliotecario, id_laptop, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_user_ricardo, :v_bib_ana, :v_lap_sn1,
        SYSTIMESTAMP, DATE '2025-11-05',
        '09:00',
        '11:00',
        'activa')
RETURNING id_reserva INTO :v_res_lap1;

-- Otra reserva activa MISMO DÍA, MISMA LAPTOP, SIN SOLAPE (11:00–13:00)
INSERT INTO ReservaLaptop (id_usuario, id_bibliotecario, id_laptop, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_user_mihael, :v_bib_luis, :v_lap_sn1,
        SYSTIMESTAMP, DATE '2025-11-05',
        '11:00',
        '13:00',
        'activa')
RETURNING id_reserva INTO :v_res_lap2;

-- Reserva cancelada en otra laptop
INSERT INTO ReservaLaptop (id_usuario, id_bibliotecario, id_laptop, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_user_maye, NULL, :v_lap_sn2,
        SYSTIMESTAMP, DATE '2025-11-10',
        '10:00',
        '12:00',
        'cancelada')
RETURNING id_reserva INTO :v_res_lap3;

-- 16) RESERVAS DE CUBÍCULO
VAR v_res_cub1 NUMBER
VAR v_res_cub2 NUMBER
VAR v_res_cub3 NUMBER
VAR v_res_cub4 NUMBER

-- Reserva ACTIVA en cubículo 1 (grupo1)
INSERT INTO ReservaCubiculo (id_grupo_usuarios, id_bibliotecario, id_cubiculo, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_grupo1, :v_bib_luis, :v_cub1,
        SYSTIMESTAMP, DATE '2025-11-06',
        '10:00',
        '12:00',
        'activa')
RETURNING id_reserva INTO :v_res_cub1;

-- Reserva PENDIENTE en mismo cubículo, mismo día, franja solapada (no bloquea porque está pendiente)
INSERT INTO ReservaCubiculo (id_grupo_usuarios, id_bibliotecario, id_cubiculo, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_grupo2, NULL, :v_cub1,
        SYSTIMESTAMP, DATE '2025-11-06',
        '11:00',
        '13:00',
        'pendiente')
RETURNING id_reserva INTO :v_res_cub2;

-- Reserva FINALIZADA (otro día)
INSERT INTO ReservaCubiculo (id_grupo_usuarios, id_bibliotecario, id_cubiculo, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_grupo1, :v_bib_ana, :v_cub2,
        SYSTIMESTAMP, DATE '2025-10-20',
        '09:00',
        '11:00',
        'finalizada')
RETURNING id_reserva INTO :v_res_cub3;

-- Reserva CANCELADA (en biblioteca Economía)
INSERT INTO ReservaCubiculo (id_grupo_usuarios, id_bibliotecario, id_cubiculo, fecha_solicitud, fecha_reserva, hora_inicio, hora_fin, estado)
VALUES (:v_grupo3, NULL, :v_cub5,
        SYSTIMESTAMP, DATE '2025-11-15',
        '14:00',
        '16:00',
        'cancelada')
RETURNING id_reserva INTO :v_res_cub4;

-- 17) SANCIONES
VAR v_sancion1 NUMBER
VAR v_sancion2 NUMBER
VAR v_sancion3 NUMBER

-- Sanción cumplida (no deja al usuario sancionado)
INSERT INTO Sancion (id_usuario, motivo, fecha_inicio, fecha_fin, estado)
VALUES (:v_user_maye, 'Retraso en devolución (caso de prueba)', DATE '2025-10-01', DATE '2025-10-03', 'cumplida')
RETURNING id_sancion INTO :v_sancion1;

-- Sanción ACTIVA (afecta estado de usuario por trigger)
INSERT INTO Sancion (id_usuario, motivo, fecha_inicio, fecha_fin, estado)
VALUES (:v_user_kevin, 'Conducta inapropiada en sala de lectura', TRUNC(SYSDATE) - 1, TRUNC(SYSDATE) + 3, 'activa')
RETURNING id_sancion INTO :v_sancion2;

-- Sanción ACTIVA corta para otro usuario
INSERT INTO Sancion (id_usuario, motivo, fecha_inicio, fecha_fin, estado)
VALUES (:v_user_fabrizio, 'Uso indebido de recursos', TRUNC(SYSDATE), TRUNC(SYSDATE) + 1, 'activa')
RETURNING id_sancion INTO :v_sancion3;

COMMIT;
