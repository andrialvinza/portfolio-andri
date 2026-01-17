import React, { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";

// Data Produk Dummy
const PRODUCTS = [
  {
    id: 1,
    name: "Headphone Wireless",
    price: 1500000,
    category: "Elektronik",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  },
  {
    id: 2,
    name: "Jam Tangan Minimalis",
    price: 850000,
    category: "Aksesoris",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
  },
  {
    id: 3,
    name: "Kamera Instan",
    price: 3200000,
    category: "Fotografi",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80",
  },
  {
    id: 4,
    name: "Sneakers Putih",
    price: 1200000,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80",
  },
  {
    id: 5,
    name: "Kacamata Hitam",
    price: 450000,
    category: "Aksesoris",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
  },
  {
    id: 6,
    name: "Ransel Laptop",
    price: 750000,
    category: "Tas",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
  },
];

const App = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // 🆕 Load cart dari localStorage saat component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("shopping-cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // 🆕 Save cart ke localStorage setiap kali cart berubah
  useEffect(() => {
    try {
      localStorage.setItem("shopping-cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  // Format mata uang ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Tambah item ke keranjang
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    // Tampilkan notifikasi
    setNotification(`${product.name} masuk keranjang!`);
    setTimeout(() => setNotification(null), 2000);
  };

  // Kurangi jumlah item
  const decreaseQuantity = (id) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: Math.max(0, item.quantity - 1) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Hapus item total
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // 🆕 Clear cart (bonus feature)
  const clearCart = () => {
    setCart([]);
    setNotification("Keranjang dikosongkan!");
    setTimeout(() => setNotification(null), 2000);
  };

  // Hitung total harga
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Hitung total item untuk badge
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">
              TokoSaya.
            </h1>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Katalog Produk
          </h2>
          <p className="mt-2 text-gray-500">
            Pilihan terbaik untuk gaya hidup modern Anda.
          </p>
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col"
            >
              <div className="relative pt-[75%] bg-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <h3 className="mt-1 text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {formatRupiah(product.price)}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  <Plus size={18} /> Tambah
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sidebar Keranjang (Modal) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Keranjang Belanja
                    </h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="ml-3 h-7 flex items-center text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="mt-8">
                    {cart.length === 0 ? (
                      <div className="text-center py-10">
                        <ShoppingCart
                          size={48}
                          className="mx-auto text-gray-300 mb-4"
                        />
                        <p className="text-gray-500">
                          Keranjang kamu masih kosong.
                        </p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          Mulai Belanja &rarr;
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* 🆕 Clear Cart Button */}
                        <button
                          onClick={clearCart}
                          className="mb-4 text-sm text-red-600 hover:text-red-500 font-medium"
                        >
                          Kosongkan Keranjang
                        </button>

                        <ul className="divide-y divide-gray-200">
                          {cart.map((item) => (
                            <li key={item.id} className="py-6 flex">
                              <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-center object-cover"
                                />
                              </div>

                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>{item.name}</h3>
                                    <p className="ml-4">
                                      {formatRupiah(item.price * item.quantity)}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.category}
                                  </p>
                                </div>
                                <div className="flex-1 flex items-end justify-between text-sm">
                                  <div className="flex items-center border rounded-md">
                                    <button
                                      onClick={() => decreaseQuantity(item.id)}
                                      className="p-1 hover:bg-gray-100 text-gray-600"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="px-2 font-medium">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="p-1 hover:bg-gray-100 text-gray-600"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                  >
                                    <Trash2 size={16} /> Hapus
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Total</p>
                      <p>{formatRupiah(totalPrice)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Ongkir dan pajak dihitung saat checkout.
                    </p>
                    <div className="mt-6">
                      <a
                        href="#"
                        className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Checkout
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Toast */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;
