// import { useState, useEffect, Component } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "../api";
// import io from "socket.io-client";

// // Error Boundary Component
// class WaiterDashboardErrorBoundary extends Component {
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

// const WaiterDashboard = () => {
//   const navigate = useNavigate();
//   const [tables, setTables] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [selectedTableId, setSelectedTableId] = useState("");
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchTables = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/tables", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setTables(response.data);
//     } catch (err) {
//       console.error("Fetch tables error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to fetch tables"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchOrders = async () => {
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
//     }
//   };

//   const fetchMenu = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/menu", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Fetched menu:", response.data);
//       setMenuItems(response.data);
//     } catch (err) {
//       console.error("Fetch menu error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to fetch menu"
//       );
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
//         if (decoded.role.toLowerCase() !== "waiter") {
//           console.log("Invalid role, redirecting to signin");
//           localStorage.removeItem("token");
//           navigate("/signin", { replace: true });
//           return;
//         }
//         fetchTables();
//         fetchOrders();
//         fetchMenu();

//         const socket = io("https://cafe-backend-opal.vercel.app", {
//           path: "/socket.io/",
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//           transports: ["websocket", "polling"], // Try WebSocket first
//         });

//         socket.on("connect", () => {
//           console.log("Socket connected:", socket.id);
//         });

//         socket.on("connect_error", (err) => {
//           console.error("Socket connection error:", {
//             message: err.message,
//             description: err.description,
//             context: err.context,
//             type: err.type,
//           });
//           setError("Failed to connect to real-time updates");
//         });

//         socket.on("error", (err) => {
//           console.error("Socket error:", err);
//         });

//         socket.on("disconnect", () => {
//           console.log("Socket disconnected");
//         });

//         socket.on("orderUpdate", (updatedOrder) => {
//           console.log("Order update received:", updatedOrder);
//           setOrders((prevOrders) =>
//             prevOrders.map((order) =>
//               order._id === updatedOrder._id ? updatedOrder : order
//             )
//           );
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
//           fetchTables();
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

//   const handleItemToggle = (itemId) => {
//     setSelectedItems((prev) =>
//       prev.includes(itemId)
//         ? prev.filter((id) => id !== itemId)
//         : [...prev, itemId]
//     );
//   };

//   const handleCreateOrder = async (e) => {
//     e.preventDefault();
//     if (!selectedTableId) {
//       setError("Please select a table");
//       return;
//     }
//     if (selectedItems.length === 0) {
//       setError("Please select at least one menu item");
//       return;
//     }
//     try {
//       const token = localStorage.getItem("token");
//       const items = selectedItems.map((itemId) => {
//         const item = menuItems.find((menuItem) => menuItem._id === itemId);
//         return {
//           menuItemId: item._id,
//           name: item.name,
//           quantity: 1,
//           category: item.category,
//           ml: item.ml || undefined,
//         };
//       });
//       const response = await axios.post(
//         "/api/orders",
//         { tableId: selectedTableId, items },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setSelectedTableId("");
//       setSelectedItems([]);
//       setError("");
//       setSuccess("Order sent to kitchen successfully");
//       fetchOrders();
//     } catch (err) {
//       console.error("Create order error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to create order"
//       );
//     }
//   };

//   const handleUpdateOrderStatus = async (orderId, status) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `/api/orders/${orderId}/status`,
//         { status },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setError("");
//       setSuccess(`Order status updated to ${status}`);
//       fetchOrders();
//     } catch (err) {
//       console.error("Update order status error:", err);
//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to update order status"
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
//     <WaiterDashboardErrorBoundary>
//       <div className="min-h-screen bg-gray-100 p-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold">Waiter Dashboard</h1>
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
//           <h2 className="text-xl font-semibold mb-4">Create Order</h2>
//           <form onSubmit={handleCreateOrder} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Select Table
//               </label>
//               <select
//                 value={selectedTableId}
//                 onChange={(e) => setSelectedTableId(e.target.value)}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               >
//                 <option value="">Select a table</option>
//                 {tables.map((table) => (
//                   <option key={table._id} value={table._id}>
//                     Table {table.tableNumber}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Select Menu Items
//               </label>
//               <div className="mt-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
//                 {menuItems.length === 0 ? (
//                   <p>No menu items available</p>
//                 ) : (
//                   menuItems.map((item) => (
//                     <div key={item._id} className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         checked={selectedItems.includes(item._id)}
//                         onChange={() => handleItemToggle(item._id)}
//                         className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                       />
//                       <label className="text-sm text-gray-700">
//                         {item.name} (₹{item.price.toFixed(2)}
//                         {item.ml ? `, ${item.ml}ml` : ""}, {item.category})
//                       </label>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               Send Order to Kitchen
//             </button>
//           </form>
//         </div>

//         <div className="bg-white p-6 rounded shadow-md mb-6">
//           <h2 className="text-xl font-semibold mb-4">Tables and Orders</h2>
//           {loading && <p>Loading...</p>}
//           {tables.length === 0 ? (
//             <p>No tables available.</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {tables.map((table) => {
//                 const tableOrders = orders.filter(
//                   (order) =>
//                     order.tableId &&
//                     order.tableId.toString() === table._id.toString()
//                 );
//                 return (
//                   <div
//                     key={table._id}
//                     className="bg-gray-50 p-4 rounded-lg shadow-md"
//                   >
//                     <h3 className="text-lg font-semibold">
//                       Table {table.tableNumber}
//                     </h3>
//                     <p>
//                       <strong>Customer:</strong>{" "}
//                       {table.customerName || "Not Assigned"}
//                     </p>
//                     <p>
//                       <strong>Orders:</strong>
//                     </p>
//                     <ul className="list-disc pl-5 mb-4">
//                       {tableOrders.length === 0 ? (
//                         <li>No orders placed.</li>
//                       ) : (
//                         tableOrders.map((order, index) => (
//                           <li key={index}>
//                             <strong>Items:</strong>{" "}
//                             {order.items
//                               .map((item) => `${item.name} x ${item.quantity}`)
//                               .join(", ")}
//                             <br />
//                             <strong>Status:</strong> {order.status}
//                             <br />
//                             <strong>Total:</strong> ₹{order.total.toFixed(2)}
//                             <div className="mt-2 flex space-x-2">
//                               {order.status === "pending" && (
//                                 <button
//                                   onClick={() =>
//                                     handleUpdateOrderStatus(
//                                       order._id,
//                                       "accepted"
//                                     )
//                                   }
//                                   className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                                 >
//                                   Accept
//                                 </button>
//                               )}
//                               {order.status === "accepted" && (
//                                 <button
//                                   onClick={() =>
//                                     handleUpdateOrderStatus(order._id, "served")
//                                   }
//                                   className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                                 >
//                                   Mark Served
//                                 </button>
//                               )}
//                             </div>
//                           </li>
//                         ))
//                       )}
//                     </ul>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </WaiterDashboardErrorBoundary>
//   );
// };

// export default WaiterDashboard;


"use client"

import { useState, useEffect, Component } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import axios from "../api"
import io from "socket.io-client"

// Error Boundary Component
class WaiterDashboardErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
          <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-rose-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-rose-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">Something went wrong</h2>
            <p className="mb-6 text-slate-600">{this.state.error?.message || "An error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 font-medium text-white transition-colors duration-200 bg-slate-700 rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const WaiterDashboard = () => {
  const navigate = useNavigate()
  const [tables, setTables] = useState([])
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [selectedTableId, setSelectedTableId] = useState("")
  const [selectedItems, setSelectedItems] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("tables") // 'tables' or 'create'

  const fetchTables = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")
      const response = await axios.get("/api/tables", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTables(response.data)
    } catch (err) {
      console.error("Fetch tables error:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch tables")
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
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
    }
  }

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")
      const response = await axios.get("/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("Fetched menu:", response.data)
      setMenuItems(response.data)
    } catch (err) {
      console.error("Fetch menu error:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch menu")
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
        if (decoded.role.toLowerCase() !== "waiter") {
          console.log("Invalid role, redirecting to signin")
          localStorage.removeItem("token")
          navigate("/signin", { replace: true })
          return
        }
        fetchTables()
        fetchOrders()
        fetchMenu()

        const socket = io("https://cafe-backend-opal.vercel.app", {
          path: "/socket.io/",
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          transports: ["websocket", "polling"], // Try WebSocket first
        })

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id)
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", {
            message: err.message,
            description: err.description,
            context: err.context,
            type: err.type,
          })
          setError("Failed to connect to real-time updates")
        })

        socket.on("error", (err) => {
          console.error("Socket error:", err)
        })

        socket.on("disconnect", () => {
          console.log("Socket disconnected")
        })

        socket.on("orderUpdate", (updatedOrder) => {
          console.log("Order update received:", updatedOrder)
          setOrders((prevOrders) => prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)))
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
          fetchTables()
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

  const handleItemToggle = (itemId) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    if (!selectedTableId) {
      setError("Please select a table")
      return
    }
    if (selectedItems.length === 0) {
      setError("Please select at least one menu item")
      return
    }
    try {
      const token = localStorage.getItem("token")
      const items = selectedItems.map((itemId) => {
        const item = menuItems.find((menuItem) => menuItem._id === itemId)
        return {
          menuItemId: item._id,
          name: item.name,
          quantity: 1,
          category: item.category,
          ml: item.ml || undefined,
        }
      })
      const response = await axios.post(
        "/api/orders",
        { tableId: selectedTableId, items },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setSelectedTableId("")
      setSelectedItems([])
      setError("")
      setSuccess("Order sent to kitchen successfully")
      fetchOrders()
    } catch (err) {
      console.error("Create order error:", err)
      setError(err.response?.data?.message || err.message || "Failed to create order")
    }
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(`/api/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      setError("")
      setSuccess(`Order status updated to ${status}`)
      fetchOrders()
    } catch (err) {
      console.error("Update order status error:", err)
      setError(err.response?.data?.message || err.message || "Failed to update order status")
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-purple-100 text-purple-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "served":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <WaiterDashboardErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <header className="bg-white shadow-md">
          <div className="container px-4 py-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 mr-3 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Waiter Dashboard</h1>
              </div>
              <div className="flex items-center self-end gap-3">
                <button
                  onClick={() => navigate("/waiter/orders")}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-slate-700 rounded-lg hover:bg-slate-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  View Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-rose-600 rounded-lg hover:bg-rose-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
          {/* Notification area */}
          {error && (
            <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-rose-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-700">{success}</span>
              </div>
            </div>
          )}

          {/* Tabs for mobile */}
          <div className="flex mb-6 overflow-x-auto border-b border-slate-200 sm:hidden">
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-4 py-2 text-sm font-medium ${activeTab === "tables"
                  ? "text-slate-800 border-b-2 border-slate-800"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Tables & Orders
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-sm font-medium ${activeTab === "create"
                  ? "text-slate-800 border-b-2 border-slate-800"
                  : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Create Order
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Create Order Section */}
            <div
              className={`lg:col-span-1 ${activeTab === "create" || activeTab === "tables" ? "block" : "hidden sm:block"
                }`}
            >
              <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="flex items-center text-xl font-semibold text-slate-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Create New Order
                  </h2>
                </div>
                <div className="p-6">
                  <form onSubmit={handleCreateOrder} className="space-y-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Select Table</label>
                      <div className="relative">
                        <select
                          value={selectedTableId}
                          onChange={(e) => setSelectedTableId(e.target.value)}
                          className="block w-full px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select a table</option>
                          {tables.map((table) => (
                            <option key={table._id} value={table._id}>
                              Table {table.tableNumber} {table.customerName ? `(${table.customerName})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">Select Menu Items</label>
                      <div className="p-4 overflow-y-auto border border-slate-200 rounded-lg max-h-64">
                        {menuItems.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-10 h-10 mb-2 text-slate-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <p className="text-slate-500">No menu items available</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {menuItems.map((item) => (
                              <div
                                key={item._id}
                                className={`flex items-center p-3 border rounded-lg transition-colors ${selectedItems.includes(item._id)
                                    ? "border-slate-500 bg-slate-50"
                                    : "border-slate-200 hover:border-slate-300"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  id={`item-${item._id}`}
                                  checked={selectedItems.includes(item._id)}
                                  onChange={() => handleItemToggle(item._id)}
                                  className="w-4 h-4 border-slate-300 rounded text-slate-600 focus:ring-slate-500"
                                />
                                <label htmlFor={`item-${item._id}`} className="flex flex-col ml-3 cursor-pointer">
                                  <span className="font-medium text-slate-800">{item.name}</span>
                                  <span className="text-sm text-slate-500">
                                    ₹{item.price.toFixed(2)}
                                    {item.ml ? `, ${item.ml}ml` : ""} • {item.category}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors duration-200 bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      Send Order to Kitchen
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Tables and Orders Section */}
            <div
              className={`lg:col-span-2 ${activeTab === "tables" || activeTab === "tables" ? "block" : "hidden sm:block"
                }`}
            >
              <div className="overflow-hidden bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="flex items-center text-xl font-semibold text-slate-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 mr-2 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Tables and Orders
                  </h2>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-slate-700"></div>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="p-12 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-16 h-16 mx-auto mb-4 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-lg text-slate-500">No tables available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                    {tables.map((table) => {
                      const tableOrders = orders.filter(
                        (order) => order.tableId && order.tableId.toString() === table._id.toString(),
                      )
                      return (
                        <div
                          key={table._id}
                          className="overflow-hidden transition-shadow border rounded-lg shadow-sm border-slate-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="flex items-center text-lg font-semibold text-slate-800">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 mr-2 text-slate-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              Table {table.tableNumber}
                            </h3>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${table.customerName ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                                }`}
                            >
                              {table.customerName ? "Occupied" : "Available"}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="mb-4">
                              <p className="flex items-center text-sm text-slate-600">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span className="font-medium text-slate-700">Customer:</span>{" "}
                                {table.customerName || <span className="italic text-slate-400">Not Assigned</span>}
                              </p>
                            </div>

                            <div>
                              <h4 className="flex items-center mb-3 text-sm font-medium text-slate-700">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                                Orders:
                              </h4>
                              {tableOrders.length === 0 ? (
                                <div className="p-4 text-center bg-slate-50 rounded-lg">
                                  <p className="text-sm text-slate-500">No orders placed.</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {tableOrders.map((order, index) => (
                                    <div key={index} className="p-4 border rounded-lg border-slate-200 bg-slate-50">
                                      <div className="flex items-center justify-between mb-3">
                                        <span
                                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                            order.status,
                                          )}`}
                                        >
                                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                        <span className="text-sm font-medium text-slate-700">
                                          ₹{order.total.toFixed(2)}
                                        </span>
                                      </div>

                                      <div className="mb-3 space-y-1">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="flex justify-between text-sm">
                                            <span>
                                              {item.name} × {item.quantity}
                                            </span>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        {order.status === "pending" && (
                                          <button
                                            onClick={() => handleUpdateOrderStatus(order._id, "accepted")}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-4 h-4 mr-1"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                            Accept
                                          </button>
                                        )}
                                        {order.status === "accepted" && (
                                          <button
                                            onClick={() => handleUpdateOrderStatus(order._id, "served")}
                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-4 h-4 mr-1"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                              />
                                            </svg>
                                            Mark Served
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </WaiterDashboardErrorBoundary>
  )
}

export default WaiterDashboard
