# Sistema de Gestión de Servicios de Estibas (MVC - Java Swing)

Sistema de escritorio desarrollado en Java con arquitectura **MVC (Modelo-Vista-Controlador)** para la gestión de servicios de estibas de una empresa de transportes, año 2026.

## 🧩 Características

- Patrón **MVC** completo (Modelo / Vista / Controlador)
- Patrón **Singleton** para el control de sesión de usuario
- Interfaz gráfica con **Java Swing**
- Persistencia en archivos (`.dat`)
- CRUD completo de servicios de estiba
- Módulo de **Login** con máximo 3 intentos
- Módulo de **Reportes** (general, por estado, por placa, por fechas, ingresos totales)
- Generación automática de número de factura (`E001-001`, `E001-002`, ...)
- Validaciones de campos y formatos

## 🛠️ Tecnologías

- Java SE (compatible con Apache NetBeans)
- Swing (JFrame, JTable, JComboBox, JOptionPane)
- Colecciones `ArrayList`
- Serialización de objetos (`Serializable`)

## 📁 Estructura del proyecto

```
estibas-mvc/
│
├── src/
│   ├── modelo/
│   │   ├── ServicioEstiba.java        # Entidad / POJO del servicio
│   │   ├── ServicioDAO.java           # Acceso a datos (CRUD + persistencia)
│   │   └── UsuarioSingleton.java      # Singleton de sesión
│   │
│   ├── vista/
│   │   ├── LoginView.java
│   │   ├── PrincipalView.java
│   │   ├── RegistrarServicioView.java
│   │   ├── BuscarServicioView.java
│   │   ├── ModificarServicioView.java
│   │   ├── EliminarServicioView.java
│   │   └── ReporteView.java
│   │
│   ├── controlador/
│   │   ├── LoginController.java
│   │   └── ServicioController.java
│   │
│   └── principal/
│       └── Main.java
│
├── data/
│   └── servicios.dat                  # Archivo de persistencia (se genera en ejecución)
│
├── docs/
│   └── diagrama-clases.png            # Diagrama UML del sistema
│
├── .gitignore
├── LICENSE
└── README.md
```

## 📦 Diagrama de clases (relaciones principales)

```
LoginView ---> LoginController ---> UsuarioSingleton
PrincipalView ---> ServicioController ---> ServicioDAO ---> ServicioEstiba
RegistrarServicioView, BuscarServicioView,
ModificarServicioView, EliminarServicioView,
ReporteView  ---> ServicioController
```

## ▶️ Ejecución

1. Clonar el repositorio.
2. Abrir el proyecto en **Apache NetBeans** (`File > Open Project`).
3. Ejecutar `principal/Main.java`.
4. Iniciar sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123`

## 👤 Credenciales por defecto

| Usuario | Contraseña |
|---------|------------|
| admin   | admin123   |

## 📋 Roadmap de desarrollo (sugerido para commits)

- [ ] `feat: estructura base del proyecto`
- [ ] `feat: modelo ServicioEstiba`
- [ ] `feat: ServicioDAO con persistencia en archivo`
- [ ] `feat: UsuarioSingleton`
- [ ] `feat: LoginView + LoginController`
- [ ] `feat: PrincipalView con menú`
- [ ] `feat: RegistrarServicioView + CRUD registrar`
- [ ] `feat: BuscarServicioView`
- [ ] `feat: ModificarServicioView`
- [ ] `feat: EliminarServicioView`
- [ ] `feat: ReporteView (reportes y totales)`
- [ ] `chore: validaciones y manejo de excepciones`
- [ ] `docs: diagrama UML y README`

## 📄 Licencia

MIT License
