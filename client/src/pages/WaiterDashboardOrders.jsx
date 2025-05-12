// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "../api";

// const WaiterDashboardOrders = () => {
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);
//   const [tables, setTables] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const fetchTables = async () => {
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
//         err.message || err.response?.data?.message || "Failed to fetch tables"
//       );
//     }
//   };

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const decoded = jwtDecode(token);
//       if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");
//       if (decoded.role.toLowerCase() !== "waiter")
//         throw new Error("Invalid role");

//       const response = await axios.get(`/api/orders?waiterId=${decoded.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOrders(response.data);
//     } catch (err) {
//       console.error("Fetch orders error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch orders"
//       );
//       if (
//         err.message === "No token found" ||
//         err.message === "Token expired" ||
//         err.message === "Invalid role"
//       ) {
//         localStorage.removeItem("token");
//         navigate("/signin", { replace: true });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTables();
//     fetchOrders();
//     const interval = setInterval(() => {
//       fetchTables();
//       fetchOrders();
//     }, 5000); // Poll every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const handleServeOrder = async (orderId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(
//         `/api/orders/${orderId}/serve`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       fetchOrders();
//     } catch (err) {
//       console.error("Serve order error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to serve order"
//       );
//     }
//   };

//   const handleGenerateBill = async (orderId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const order = orders.find((o) => o._id === orderId);
//       if (!order || order.status !== "served" || order.billGenerated) {
//         setError("Order must be served and unbilled to generate bill");
//         return;
//       }
//       await axios.put(
//         `/api/orders/${orderId}/generate-bill`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       fetchOrders();
//       fetchTables();
//     } catch (err) {
//       console.error("Generate bill error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to generate bill"
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
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Waiter Orders</h1>
//         <div className="space-x-4">
//           <button
//             onClick={() => navigate("/waiter")}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Back to Dashboard
//           </button>
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded shadow-md">
//         <h2 className="text-xl font-semibold mb-4">My Orders</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {loading && <p>Loading...</p>}
//         {orders.length === 0 ? (
//           <p>No orders placed.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white">
//               <thead>
//                 <tr>
//                   <th className="py-2 px-4 border-b text-left">Table</th>
//                   <th className="py-2 px-4 border-b text-left">Customer</th>
//                   <th className="py-2 px-4 border-b text-left">Items</th>
//                   <th className="py-2 px-4 border-b text-left">Status</th>
//                   <th className="py-2 px-4 border-b text-left">Total</th>
//                   <th className="py-2 px-4 border-b text-left">
//                     Bill Generated
//                   </th>
//                   <th className="py-2 px-4 border-b text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders.map((order) => {
//                   const table = tables.find(
//                     (t) => t._id.toString() === order.tableId.toString()
//                   );
//                   return (
//                     <tr key={order._id}>
//                       <td className="py-2 px-4 border-b">
//                         {table ? `Table ${table.tableNumber}` : "Unknown"}
//                       </td>
//                       <td className="py-2 px-4 border-b">
//                         {table?.customerName || "Not Assigned"}
//                       </td>
//                       <td className="py-2 px-4 border-b">
//                         {order.items.map((item) => (
//                           <div key={item.menuItemId}>
//                             {item.menuItemId?.name} x {item.quantity} (₹
//                             {item.menuItemId?.price?.toFixed(2)})
//                           </div>
//                         ))}
//                       </td>
//                       <td className="py-2 px-4 border-b">{order.status}</td>
//                       <td className="py-2 px-4 border-b">
//                         ₹{order.total.toFixed(2)}
//                       </td>
//                       <td className="py-2 px-4 border-b">
//                         {order.billGenerated ? "Yes" : "No"}
//                       </td>
//                       <td className="py-2 px-4 border-b">
//                         {order.status === "ready" && (
//                           <button
//                             onClick={() => handleServeOrder(order._id)}
//                             className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
//                           >
//                             Serve
//                           </button>
//                         )}
//                         {order.status === "served" && !order.billGenerated && (
//                           <button
//                             onClick={() => handleGenerateBill(order._id)}
//                             className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
//                           >
//                             Generate Bill
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WaiterDashboardOrders;


"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import axios from "../api"

const WaiterDashboardOrders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")
      const response = await axios.get("/api/tables", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTables(response.data)
    } catch (err) {
      console.error("Fetch tables error:", err)
      setError(err.message || err.response?.data?.message || "Failed to fetch tables")
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")
      const decoded = jwtDecode(token)
      if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired")
      if (decoded.role.toLowerCase() !== "waiter") throw new Error("Invalid role")

      const response = await axios.get(`/api/orders?waiterId=${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrders(response.data)
    } catch (err) {
      console.error("Fetch orders error:", err)
      setError(err.message || err.response?.data?.message || "Failed to fetch orders")
      if (err.message === "No token found" || err.message === "Token expired" || err.message === "Invalid role") {
        localStorage.removeItem("token")
        navigate("/signin", { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleServeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `/api/orders/${orderId}/serve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      fetchOrders()
    } catch (err) {
      console.error("Serve order error:", err)
      setError(err.response?.data?.message || err.message || "Failed to serve order")
    }
  }

  const handleGenerateBill = async (orderId) => {
    try {
      const token = localStorage.getItem("token")
      const order = orders.find((o) => o._id === orderId)
      if (!order || order.status !== "served" || order.billGenerated) {
        setError("Order must be served and unbilled to generate bill")
        return
      }
      await axios.put(
        `/api/orders/${orderId}/generate-bill`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      fetchOrders()
      fetchTables()
    } catch (err) {
      console.error("Generate bill error:", err)
      setError(err.response?.data?.message || err.message || "Failed to generate bill")
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
      case "preparing":
        return "bg-purple-100 text-purple-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "served":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Waiter Orders</h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/waiter")}
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
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

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">My Orders</h2>
          </div>

          {error && (
            <div className="mx-6 my-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                {error}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-4 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg">No orders placed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Bill
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orders.map((order) => {
                    const table = tables.find((t) => t._id.toString() === order.tableId.toString())
                    return (
                      <tr key={order._id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          {table ? (
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-slate-400"
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
                            </div>
                          ) : (
                            "Unknown"
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-slate-700">
                          {table?.customerName || <span className="text-slate-400 italic">Not Assigned</span>}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700">
                          <div className="space-y-1 max-w-xs">
                            {order.items.map((item) => (
                              <div key={item.menuItemId} className="flex justify-between">
                                <span className="font-medium">
                                  {item.menuItemId?.name} × {item.quantity}
                                </span>
                                <span className="text-slate-500">₹{item.menuItemId?.price?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-slate-800">
                          ₹{order.total.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm">
                          {order.billGenerated ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Generated
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-right">
                          {order.status === "ready" && (
                            <button
                              onClick={() => handleServeOrder(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Serve
                            </button>
                          )}
                          {order.status === "served" && !order.billGenerated && (
                            <button
                              onClick={() => handleGenerateBill(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              Generate Bill
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default WaiterDashboardOrders
