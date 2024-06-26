const { useState, useEffect, createContext, useReducer, useContext } = React;
const productosIniciales = [
    {
      id: 1,
      nombre: "Leche Descremada La Serenísima",
      stock: 10,
      precio: 120
    },
    {
      id: 2,
      nombre: "Harina 000 Coto",
      stock: 50,
      precio: 80
    },
    {
      id: 3,
      nombre: "Huevos Blancos Granja Blanca x 30",
      stock: 20,
      precio: 350
    },
    {
      id: 4,
      nombre: "Carne Vacuna Molida",
      stock: 15,
      precio: 600
    },
    {
      id: 5,
      nombre: "Pollo Fresco",
      stock: 10,
      precio: 450
    },
    {
      id: 6,
      nombre: "Arroz Blanco Doble Carolina",
      stock: 25,
      precio: 150
    },
    {
      id: 7,
      nombre: "Fideos Spaghetti Nº 5 Luchetti",
      stock: 30,
      precio: 80
    },
    {
      id: 8,
      nombre: "Tomates Perita Chocón",
      stock: 20,
      precio: 100
    },
    {
      id: 9,
      nombre: "Papas",
      stock: 30,
      precio: 120
    },
    {
      id: 10,
      nombre: "Manzanas Rojas",
      stock: 25,
      precio: 150
    },
    {
      id: 11,
      nombre: "Bananas",
      stock: 20,
      precio: 100
    },
    {
      id: 12,
      nombre: "Cerveza Brahma Lager",
      stock: 15,
      precio: 250
    },
    {
      id: 13,
      nombre: "Coca Cola 2.5 L",
      stock: 10,
      precio: 300
    },
    {
      id: 14,
      nombre: "Agua Mineral Villa del Sur 1.5 L",
      stock: 20,
      precio: 60
    },
    {
      id: 15,
      nombre: "Café Nescafé Clásico",
      stock: 15,
      precio: 200
    },
    {
      id: 16,
      nombre: "Té Ser Supremo",
      stock: 20,
      precio: 180
    },
    {
      id: 17,
      nombre: "Shampoo Head & Shoulders",
      stock: 10,
      precio: 350
    },
    {
      id: 18,
      nombre: "Jabón Lux",
      stock: 15,
      precio: 100
    },
    {
      id: 19,
      nombre: "Papel Higiénico Scott Doble Hoja",
      stock: 12,
      precio: 200
    },
    {
      id: 20,
      nombre: "Detergente Ala Matic",
      stock: 8,
      precio: 300
    }
  ]
  
  const ProductosContext = createContext()

const productosReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTOS':
      return { ...state, productos: action.payload };
    case 'AGREGAR_PRODUCTO':
      return { ...state, productos: [...state.productos, action.payload] };
    case 'EDITAR_PRODUCTO':
      const productosEditados = state.productos.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      return { ...state, productos: productosEditados };
    case 'ELIMINAR_PRODUCTO':
      const productosEliminados = state.productos.filter(
        (p) => p.id !== action.payload
      );
      return { ...state, productos: productosEliminados };
    case 'AGREGAR_AL_CARRITO':
      const producto = state.productos.find((p) => p.id === action.payload);
      if (producto && producto.stock > 0) {
        const nuevoProducto = { ...producto, stock: producto.stock - 1 };
        const productosActualizados = state.productos.map((p) =>
          p.id === action.payload ? nuevoProducto : p
        );

        const carritoExistente = state.carrito.find(
          (p) => p.id === action.payload
        );
        const carritoActualizado = carritoExistente
          ? state.carrito.map((p) =>
              p.id === action.payload ? { ...p, cantidad: p.cantidad + 1 } : p
            )
          : [...state.carrito, { ...producto, cantidad: 1 }];

        return { ...state, productos: productosActualizados, carrito: carritoActualizado };
      }
      return state;
    case 'SET_CARRITO':
      return { ...state, carrito: action.payload };
    default:
      return state;
  }
};

const ProductosProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productosReducer, {
    productos: [],
    carrito: [],
  });

  useEffect(() => {
    if (localStorage.getItem('productos') === null) {
      localStorage.setItem('productos', JSON.stringify(productosIniciales));
    }
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      dispatch({ type: 'SET_PRODUCTOS', payload: JSON.parse(productosGuardados) });
    }
  }, []);

  return (
    <ProductosContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductosContext.Provider>
  );
};

const useProductos = () => {
  const context = useContext(ProductosContext);
  if (!context) {
    throw new Error('useProductos must be used within a ProductosProvider');
  }
  return context;
};


const Carrito = () => {
  const { state } = useProductos();
  const { carrito } = state;
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const total = subtotal;

  return (
    <div className="carrito">
      <h2>Carrito</h2>
      <ul>
        {carrito.map((item) => (
          <li key={item.id}>
            {item.nombre} - {item.cantidad} unidades - ${item.precio * item.cantidad}
          </li>
        ))}
      </ul>
      <h3>Subtotal: ${subtotal}</h3>
      <h3>Total: ${total}</h3>
    </div>
  );
};

const Productos = ({ onEditarProducto }) => {
  const { state, dispatch } = useProductos();
  const { productos } = state;

  const seleccionarProductoParaEditar = (producto) => {
    onEditarProducto(producto);
  };

  const agregarAlCarrito = (id) => {
    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: id });
  };

  const eliminarProducto = (id) => {
    dispatch({ type: 'ELIMINAR_PRODUCTO', payload: id });
  };

  return (
    <div className="tabla-productos">
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">id</th>
            <th scope="col">Nombre del Producto</th>
            <th scope="col">Unidades</th>
            <th scope="col">Precio</th>
            <th scope="col">Acciones</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <th scope="row">{p.id}</th>
              <td>{p.nombre}</td>
              <td>{p.stock}</td>
              <td>{p.precio}</td>
              <td>
                <i
                  className="fa-solid fa-cart-plus"
                  onClick={(e) => {
                    e.stopPropagation();
                    agregarAlCarrito(p.id);
                  }}
                ></i>
              </td>
              <td>
                <i
                  className="fa-regular fa-pen-to-square"
                  onClick={(e) => {
                    e.stopPropagation();
                    seleccionarProductoParaEditar(p);
                  }}
                ></i>
              </td>
              <td>
                <i
                  className="fa-solid fa-trash"
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarProducto(p.id);
                  }}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



const Form = ({ id, nombre, stock, precio, setVentana }) => {
  const { dispatch } = useProductos();
  const [nuevonombre, setNombre] = useState(nombre);
  const [unidades, setUnidades] = useState(stock);
  const [valor, setValor] = useState(precio);

  useEffect(() => {
    setNombre(nombre);
    setUnidades(stock);
    setValor(precio);
  }, [nombre, stock, precio]);

  const editar = (e) => {
    e.preventDefault();
    const productosModificados = {
      id,
      nombre: nuevonombre,
      stock: unidades,
      precio: valor,
    };
    if (id !== null) {
      dispatch({ type: 'EDITAR_PRODUCTO', payload: productosModificados });
    } else {
      dispatch({ type: 'AGREGAR_PRODUCTO', payload: productosModificados });
    }
    setVentana(false);
  };

  const cancelar = (e) => {
    e.preventDefault();
    setNombre(nombre);
    setUnidades(stock);
    setValor(precio);
    setVentana(false);
  };

  return (
    <form>
      <input
        type="text"
        placeholder="Nombre"
        value={nuevonombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="number"
        placeholder="Unidades"
        value={unidades}
        onChange={(e) => setUnidades(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Precio"
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
      />
      <button onClick={editar}>Aceptar</button>
      <button onClick={cancelar}>Cancelar</button>
    </form>
  );
};



function App() {
  const [agregar, setAgregar] = useState(false);
  const [home, setHome] = useState(true); 
  const [ventanaCarrito, setVentanaCarrito] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const productosVacios = {
    id: null,
    nombre: '',
    stock: 0,
    precio: 0,
  };

  const handleAgregarProducto = () => {
    setProductoSeleccionado(productosVacios);
    setAgregar(true);
    setHome(false);
    setVentanaCarrito(false);
  };

  const handleEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setAgregar(true);
    setHome(false);
    setVentanaCarrito(false);
  };

  return (
    <ProductosProvider>
      <nav className="navbar bg-body-tertiary">
        <div className="container-fluid"></div>
      </nav>
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <form className="d-flex" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar"
              aria-label="Search"
            />
            <button className="btn btn-outline-success" type="submit">
              Buscar
            </button>
          </form>
          <a className="navbar-brand" href="#">
            SuperMerca
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
                Lugares
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    aria-current="page"
                    href="#"
                    onClick={() => {
                      setHome(true);
                      setAgregar(false);
                      setVentanaCarrito(false);
                    }}
                  >
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="#"
                    onClick={() => {
                      setVentanaCarrito(true);
                      setHome(false);
                      setAgregar(false);
                    }}
                  >
                    Carrito
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Acciones
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleAgregarProducto}
                      >
                        Agregar Productos
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Editar Productos
                      </a>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        Historial
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      {agregar && (
        <Form
          {...productoSeleccionado}
          setVentana={setAgregar}
        />
      )}
      {home && <Productos onEditarProducto={handleEditarProducto} />}
      {ventanaCarrito && <Carrito />}
    </ProductosProvider>
  );
}




