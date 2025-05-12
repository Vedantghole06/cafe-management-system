// import { useState, useEffect, Component } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "../api";
// import io from "socket.io-client";

// // Error Boundary Component
// class KitchenDashboardErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="p-8 text-center">
//           <h2 className="text-2xl font-bold text-red-500">
//             Something went wrong
//           </h2>
//           <p className="text-gray-600">
//             {this.state.error?.message || "An error occurred"}
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Reload
//           </button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const KitchenDashboard = () => {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/orders", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Fetched orders:", response.data);
//       setOrders(response.data);
//     } catch (err) {
//       console.error("Fetch orders error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to fetch orders"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         console.log("useEffect Decoded:", decoded);
//         if (decoded.exp * 1000 < Date.now()) {
//           console.log("Token expired, redirecting to signin");
//           localStorage.removeItem("token");
//           navigate("/signin", { replace: true });
//           return;
//         }
//         if (decoded.role.toLowerCase() !== "kitchen") {
//           console.log("Invalid role, redirecting to signin");
//           localStorage.removeItem("token");
//           navigate("/signin", { replace: true });
//           return;
//         }
//         fetchOrders();

//         const socket = io("https://cafe-backend-opal.vercel.app", {
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//         });

//         socket.on("connect", () => {
//           console.log("Socket connected:", socket.id);
//         });

//         socket.on("connect_error", (err) => {
//           console.error("Socket connection error:", err.message);
//           setError("Failed to connect to real-time updates");
//         });

//         socket.on("disconnect", () => {
//           console.log("Socket disconnected");
//         });

//         socket.on("orderUpdate", (updatedOrder) => {
//           console.log("Order update received:", updatedOrder);
//           setOrders((prevOrders) => {
//             const existingOrder = prevOrders.find(
//               (order) => order._id === updatedOrder._id
//             );
//             if (existingOrder) {
//               return prevOrders.map((order) =>
//                 order._id === updatedOrder._id ? updatedOrder : order
//               );
//             }
//             return [...prevOrders, updatedOrder];
//           });
//         });

//         const interval = setInterval(() => {
//           const currentToken = localStorage.getItem("token");
//           if (currentToken) {
//             const currentDecoded = jwtDecode(currentToken);
//             if (currentDecoded.exp * 1000 < Date.now()) {
//               console.log(
//                 "Token expired during interval, redirecting to signin"
//               );
//               localStorage.removeItem("token");
//               navigate("/signin", { replace: true });
//               clearInterval(interval);
//               socket.disconnect();
//               return;
//             }
//           }
//           fetchOrders();
//         }, 5000);

//         return () => {
//           socket.disconnect();
//           clearInterval(interval);
//         };
//       } catch (err) {
//         console.error("Token error:", err);
//         setError("Authentication error: Invalid token");
//         localStorage.removeItem("token");
//         navigate("/signin", { replace: true });
//       }
//     } else {
//       console.log("No token found, redirecting to signin");
//       navigate("/signin", { replace: true });
//     }
//   }, [navigate]);

//   const handleMarkReady = async (orderId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `/api/orders/${orderId}/status`,
//         { status: "served" },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setError("");
//       setSuccess("Order marked as ready");
//       fetchOrders();
//     } catch (err) {
//       console.error("Mark order ready error:", err);
//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to mark order ready"
//       );
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (token) {
//         await axios.post(
//           "/api/auth/logout",
//           {},
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//     } finally {
//       localStorage.removeItem("token");
//       navigate("/signin", { replace: true });
//     }
//   };

//   return (
//     <KitchenDashboardErrorBoundary>
//       <div className="min-h-screen bg-gray-100 p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//           >
//             Logout
//           </button>
//         </div>

//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {success && <p className="text-green-500 mb-4">{success}</p>}

//         <div className="bg-white p-6 rounded shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4">Orders</h2>
//           {loading && <p>Loading...</p>}
//           {orders.length === 0 ? (
//             <p>No orders available.</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {orders.map((order) => (
//                 <div
//                   key={order._id}
//                   className="bg-gray-50 p-4 rounded-lg shadow-md"
//                 >
//                   <h3 className="text-lg font-semibold">
//                     Order for Table {order.tableId?.tableNumber || "Unknown"}
//                   </h3>
//                   <p>
//                     <strong>Items:</strong>{" "}
//                     {order.items
//                       .map((item) => `${item.name} x ${item.quantity}`)
//                       .join(", ")}
//                   </p>
//                   <p>
//                     <strong>Status:</strong> {order.status}
//                   </p>
//                   <p>
//                     <strong>Total:</strong> ₹{order.total.toFixed(2)}
//                   </p>
//                   {order.status !== "served" && (
//                     <button
//                       onClick={() => handleMarkReady(order._id)}
//                       className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                     >
//                       Mark Ready
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </KitchenDashboardErrorBoundary>
//   );
// };

// export default KitchenDashboard;


"use client"

import { useState, useEffect, Component } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import axios from "../api"
import io from "socket.io-client"
import { ChefHat, LogOut, RefreshCw, CheckCircle, AlertCircle, Clock, Utensils } from "lucide-react"

// Error Boundary Component
class KitchenDashboardErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
          <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-500 text-center">Something went wrong</h2>
            <p className="mt-2 text-gray-600 text-center">{this.state.error?.message || "An error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const KitchenDashboard = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")
      const response = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Fetched orders:", response.data)
      setOrders(response.data)
    } catch (err) {
      console.error("Fetch orders error:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        console.log("useEffect Decoded:", decoded)
        if (decoded.exp * 1000 < Date.now()) {
          console.log("Token expired, redirecting to signin")
          localStorage.removeItem("token")
          navigate("/signin", { replace: true })
          return
        }
        if (decoded.role.toLowerCase() !== "kitchen") {
          console.log("Invalid role, redirecting to signin")
          localStorage.removeItem("token")
          navigate("/signin", { replace: true })
          return
        }
        fetchOrders()

        const socket = io("https://cafe-backend-opal.vercel.app", {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id)
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message)
          setError("Failed to connect to real-time updates")
        })

        socket.on("disconnect", () => {
          console.log("Socket disconnected")
        })

        socket.on("orderUpdate", (updatedOrder) => {
          console.log("Order update received:", updatedOrder)
          setOrders((prevOrders) => {
            const existingOrder = prevOrders.find((order) => order._id === updatedOrder._id)
            if (existingOrder) {
              return prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
            }
            return [...prevOrders, updatedOrder]
          })
        })

        const interval = setInterval(() => {
          const currentToken = localStorage.getItem("token")
          if (currentToken) {
            const currentDecoded = jwtDecode(currentToken)
            if (currentDecoded.exp * 1000 < Date.now()) {
              console.log("Token expired during interval, redirecting to signin")
              localStorage.removeItem("token")
              navigate("/signin", { replace: true })
              clearInterval(interval)
              socket.disconnect()
              return
            }
          }
          fetchOrders()
        }, 5000)

        return () => {
          socket.disconnect()
          clearInterval(interval)
        }
      } catch (err) {
        console.error("Token error:", err)
        setError("Authentication error: Invalid token")
        localStorage.removeItem("token")
        navigate("/signin", { replace: true })
      }
    } else {
      console.log("No token found, redirecting to signin")
      navigate("/signin", { replace: true })
    }
  }, [navigate])

  const handleMarkReady = async (orderId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: "served" },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setError("")
      setSuccess("Order marked as ready")
      fetchOrders()
    } catch (err) {
      console.error("Mark order ready error:", err)
      setError(err.response?.data?.message || err.message || "Failed to mark order ready")
    }
  }

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await axios.post(
          "/api/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem("token")
      navigate("/signin", { replace: true })
    }
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "served":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "preparing":
        return <Utensils className="w-4 h-4" />
      case "ready":
        return <CheckCircle className="w-4 h-4" />
      case "served":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <KitchenDashboardErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <ChefHat className="h-8 w-8 text-emerald-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Kitchen Dashboard</h1>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Orders Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Active Orders</h2>
                <button
                  onClick={fetchOrders}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No orders available</h3>
                  <p className="mt-1 text-sm text-gray-500">New orders will appear here when they're placed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Table {order.tableId?.tableNumber || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-500">Order #{order._id.slice(-6)}</p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Items</h4>
                            <ul className="mt-1 space-y-1">
                              {order.items.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600 flex justify-between">
                                  <span>{item.name}</span>
                                  <span className="font-medium">x{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Total</span>
                              <span className="text-lg font-semibold text-gray-900">₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {order.status !== "served" && (
                          <button
                            onClick={() => handleMarkReady(order._id)}
                            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </KitchenDashboardErrorBoundary>
  )
}

export default KitchenDashboard
