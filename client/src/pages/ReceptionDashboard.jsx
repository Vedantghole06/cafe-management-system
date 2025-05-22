// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "../api";

// const ReceptionDashboard = () => {
//   const navigate = useNavigate();
//   const [tables, setTables] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [tableNumber, setTableNumber] = useState("");
//   const [menuForm, setMenuForm] = useState({
//     name: "",
//     price: "",
//     category: "Veg",
//     ml: "",
//   });
//   const [accountForm, setAccountForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "waiter",
//   });

//   const fetchTables = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const decoded = jwtDecode(token);
//       if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");
//       if (decoded.role.toLowerCase() !== "reception")
//         throw new Error("Invalid role");

//       const response = await axios.get("/api/tables", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // Sort tables by tableNumber in ascending order
//       const sortedTables = response.data.sort(
//         (a, b) => a.tableNumber - b.tableNumber
//       );
//       setTables(sortedTables);
//     } catch (err) {
//       console.error("Fetch tables error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch tables"
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

//   const fetchMenu = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/menu", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems(response.data);
//     } catch (err) {
//       console.error("Fetch menu error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch menu"
//       );
//     }
//   };

//   const fetchOrders = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/orders", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOrders(response.data);
//     } catch (err) {
//       console.error("Fetch orders error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch orders"
//       );
//     }
//   };

//   useEffect(() => {
//     fetchTables();
//     fetchMenu();
//     fetchOrders();
//     const interval = setInterval(() => {
//       fetchTables();
//       fetchMenu();
//       fetchOrders();
//     }, 5000); // Poll every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const handleAddTable = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       if (!tableNumber || isNaN(tableNumber) || parseInt(tableNumber) < 1) {
//         setError("Please enter a valid table number");
//         return;
//       }
//       await axios.post(
//         "/api/tables",
//         { tableNumber: parseInt(tableNumber) },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setTableNumber("");
//       setError("");
//       setSuccess("Table added successfully");
//       fetchTables();
//     } catch (err) {
//       console.error("Add table error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to add table"
//       );
//     }
//   };

//   const handleDeleteTable = async (tableId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`/api/tables/${tableId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setError("");
//       setSuccess("Table deleted successfully");
//       fetchTables();
//     } catch (err) {
//       console.error("Delete table error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to delete table"
//       );
//     }
//   };

//   const handleAddMenuItem = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const { name, price, category, ml } = menuForm;
//       if (!name || !price || isNaN(price) || parseFloat(price) <= 0) {
//         setError("Please enter a valid name and price");
//         return;
//       }
//       if (category === "Beverages" && (!ml || isNaN(ml) || parseInt(ml) <= 0)) {
//         setError("Please enter a valid ml value for Beverages");
//         return;
//       }
//       const payload = {
//         name,
//         price: parseFloat(price),
//         category,
//         ...(category === "Beverages" && { ml: parseInt(ml) }),
//       };
//       await axios.post("/api/menu", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuForm({ name: "", price: "", category: "Veg", ml: "" });
//       setError("");
//       setSuccess("Menu item added successfully");
//       fetchMenu();
//     } catch (err) {
//       console.error("Add menu item error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to add menu item"
//       );
//     }
//   };

//   const handlePayBill = async (tableId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const tableOrders = orders.filter(
//         (order) =>
//           order.tableId.toString() === tableId.toString() &&
//           order.billGenerated &&
//           !order.paid
//       );
//       if (tableOrders.length === 0) {
//         setError("No unpaid bills found for this table");
//         return;
//       }
//       for (const order of tableOrders) {
//         await axios.put(
//           `/api/orders/${order._id}/pay`,
//           {},
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//       }
//       setError("");
//       setSuccess("Bill paid successfully");
//       fetchTables();
//       fetchOrders();
//     } catch (err) {
//       console.error("Pay bill error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to pay bill"
//       );
//     }
//   };

//   const handleCreateAccount = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const { name, email, password, confirmPassword, role } = accountForm;
//       if (!name || !email || !password || !confirmPassword || !role) {
//         setError("All fields are required");
//         return;
//       }
//       if (password !== confirmPassword) {
//         setError("Passwords do not match");
//         return;
//       }
//       if (!["waiter", "kitchen"].includes(role)) {
//         setError("Invalid role selected");
//         return;
//       }
//       await axios.post(
//         "/api/auth/signup/reception",
//         { name, email, password, confirmPassword, role },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAccountForm({
//         name: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         role: "waiter",
//       });
//       setError("");
//       setSuccess(`Account created for ${name} (${role})`);
//     } catch (err) {
//       console.error("Create account error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to create account"
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
//         <h1 className="text-3xl font-bold">Reception Dashboard</h1>
//         <button
//           onClick={handleLogout}
//           className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//         >
//           Logout
//         </button>
//       </div>

//       <div className="bg-white p-6 rounded shadow-md mb-6">
//         <h2 className="text-xl font-semibold mb-4">Add Table</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {success && <p className="text-green-500 mb-4">{success}</p>}
//         <form onSubmit={handleAddTable} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Table Number
//             </label>
//             <input
//               type="number"
//               value={tableNumber}
//               onChange={(e) => setTableNumber(e.target.value)}
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Add Table
//           </button>
//         </form>
//       </div>

//       <div className="bg-white p-6 rounded shadow-md mb-6">
//         <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
//         <form onSubmit={handleAddMenuItem} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               value={menuForm.name}
//               onChange={(e) =>
//                 setMenuForm({ ...menuForm, name: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Price
//             </label>
//             <input
//               type="number"
//               value={menuForm.price}
//               onChange={(e) =>
//                 setMenuForm({ ...menuForm, price: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Category
//             </label>
//             <select
//               value={menuForm.category}
//               onChange={(e) =>
//                 setMenuForm({ ...menuForm, category: e.target.value, ml: "" })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//             >
//               <option value="Veg">Veg</option>
//               <option value="Non-Veg">Non-Veg</option>
//               <option value="Drinks">Drinks</option>
//               <option value="Beverages">Beverages</option>
//             </select>
//           </div>
//           {menuForm.category === "Beverages" && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Milliliters (ml)
//               </label>
//               <input
//                 type="number"
//                 value={menuForm.ml}
//                 onChange={(e) =>
//                   setMenuForm({ ...menuForm, ml: e.target.value })
//                 }
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//                 required
//               />
//             </div>
//           )}
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Add Menu Item
//           </button>
//         </form>
//       </div>

//       <div className="bg-white p-6 rounded shadow-md mb-6">
//         <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
//         {menuItems.length === 0 ? (
//           <p>No menu items found.</p>
//         ) : (
//           <div className="space-y-6">
//             {["Veg", "Non-Veg", "Drinks", "Beverages"].map((category) => {
//               const items = menuItems.filter(
//                 (item) => item.category === category
//               );
//               if (items.length === 0) return null;
//               return (
//                 <div key={category}>
//                   <h3 className="text-lg font-semibold">{category}</h3>
//                   <ul className="list-disc pl-5">
//                     {items.map((item) => (
//                       <li key={item._id}>
//                         {item.name} - ₹{item.price.toFixed(2)}
//                         {item.ml ? ` (${item.ml} ml)` : ""}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <div className="bg-white p-6 rounded shadow-md mb-6">
//         <h2 className="text-xl font-semibold mb-4">Manage Accounts</h2>
//         <form onSubmit={handleCreateAccount} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               value={accountForm.name}
//               onChange={(e) =>
//                 setAccountForm({ ...accountForm, name: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               value={accountForm.email}
//               onChange={(e) =>
//                 setAccountForm({ ...accountForm, email: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               value={accountForm.password}
//               onChange={(e) =>
//                 setAccountForm({ ...accountForm, password: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Confirm Password
//             </label>
//             <input
//               type="password"
//               value={accountForm.confirmPassword}
//               onChange={(e) =>
//                 setAccountForm({
//                   ...accountForm,
//                   confirmPassword: e.target.value,
//                 })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Role
//             </label>
//             <select
//               value={accountForm.role}
//               onChange={(e) =>
//                 setAccountForm({ ...accountForm, role: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//             >
//               <option value="waiter">Waiter</option>
//               <option value="kitchen">Kitchen</option>
//             </select>
//           </div>
//           <button
//             type="submit"
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Create Account
//           </button>
//         </form>
//       </div>

//       <div className="bg-white p-6 rounded shadow-md">
//         <h2 className="text-xl font-semibold mb-4">Tables</h2>
//         {loading && <p>Loading...</p>}
//         {tables.length === 0 ? (
//           <p>No tables found.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {tables.map((table) => {
//               const tableOrders = orders.filter(
//                 (order) => order.tableId.toString() === table._id.toString()
//               );
//               const billGenerated = tableOrders.some(
//                 (order) => order.billGenerated
//               );
//               const isPaid =
//                 tableOrders.length > 0 &&
//                 tableOrders.every((order) => order.paid);
//               return (
//                 <div
//                   key={table._id}
//                   className="bg-gray-50 p-4 rounded-lg shadow-md"
//                 >
//                   <h3 className="text-lg font-semibold">
//                     Table {table.tableNumber}
//                   </h3>
//                   <p>
//                     <strong>Customer:</strong>{" "}
//                     {table.customerName || "Not Assigned"}
//                   </p>
//                   <p>
//                     <strong>Assigned Waiter:</strong>{" "}
//                     {table.waiterId?.name || "Not Assigned"}
//                   </p>
//                   <p>
//                     <strong>Total Bill:</strong> ₹{table.totalBill.toFixed(2)}
//                   </p>
//                   <p>
//                     <strong>Orders:</strong>
//                   </p>
//                   <ul className="list-disc pl-5 mb-4">
//                     {tableOrders.length === 0 ? (
//                       <li>No orders placed.</li>
//                     ) : (
//                       tableOrders.map((order, index) => (
//                         <li key={index}>
//                           {order.items.map((item) => (
//                             <span key={item.menuItemId}>
//                               {item.name} x {item.quantity}
//                               {item.ml ? ` (${item.ml} ml)` : ""}
//                             </span>
//                           ))}
//                           <span className="ml-2 text-sm text-gray-600">
//                             ({order.status})
//                           </span>
//                         </li>
//                       ))
//                     )}
//                   </ul>
//                   <div className="flex justify-center space-x-4">
//                     {!isPaid && billGenerated && (
//                       <button
//                         onClick={() => handlePayBill(table._id)}
//                         className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
//                       >
//                         Pay Bill
//                       </button>
//                     )}
//                     {isPaid && (
//                       <button
//                         onClick={() => handleDeleteTable(table._id)}
//                         className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
//                       >
//                         Delete Table
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReceptionDashboard;

// 

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "../api";

// const ReceptionDashboard = () => {
//   const navigate = useNavigate();
//   const [tables, setTables] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [tableNumber, setTableNumber] = useState("");
//   const [activeTab, setActiveTab] = useState("tables");
//   const [menuForm, setMenuForm] = useState({
//     name: "",
//     price: "",
//     category: "Veg",
//     ml: "",
//   });
//   const [accountForm, setAccountForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "waiter",
//   });

//   const fetchTables = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const decoded = jwtDecode(token);
//       if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");
//       if (decoded.role.toLowerCase() !== "reception")
//         throw new Error("Invalid role");

//       const response = await axios.get("/api/tables", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       // Sort tables by tableNumber in ascending order
//       const sortedTables = response.data.sort(
//         (a, b) => a.tableNumber - b.tableNumber
//       );
//       setTables(sortedTables);
//     } catch (err) {
//       console.error("Fetch tables error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch tables"
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

//   const fetchMenu = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/menu", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems(response.data);
//     } catch (err) {
//       console.error("Fetch menu error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch menu"
//       );
//     }
//   };

//   const fetchOrders = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No token found");
//       const response = await axios.get("/api/orders", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setOrders(response.data);
//     } catch (err) {
//       console.error("Fetch orders error:", err);
//       setError(
//         err.message || err.response?.data?.message || "Failed to fetch orders"
//       );
//     }
//   };

//   useEffect(() => {
//     fetchTables();
//     fetchMenu();
//     fetchOrders();
//     const interval = setInterval(() => {
//       fetchTables();
//       fetchMenu();
//       fetchOrders();
//     }, 5000); // Poll every 5 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const handleAddTable = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       if (!tableNumber || isNaN(tableNumber) || parseInt(tableNumber) < 1) {
//         setError("Please enter a valid table number");
//         return;
//       }
//       await axios.post(
//         "/api/tables",
//         { tableNumber: parseInt(tableNumber) },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setTableNumber("");
//       setError("");
//       setSuccess("Table added successfully");
//       fetchTables();
//     } catch (err) {
//       console.error("Add table error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to add table"
//       );
//     }
//   };

//   const handleDeleteTable = async (tableId) => {
//     try {
//       const token = localStorage.getItem("token");
//       await axios.delete(`/api/tables/${tableId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setError("");
//       setSuccess("Table deleted successfully");
//       fetchTables();
//     } catch (err) {
//       console.error("Delete table error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to delete table"
//       );
//     }
//   };

//   const handleAddMenuItem = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const { name, price, category, ml } = menuForm;
//       if (!name || !price || isNaN(price) || parseFloat(price) <= 0) {
//         setError("Please enter a valid name and price");
//         return;
//       }
//       if (category === "Beverages" && (!ml || isNaN(ml) || parseInt(ml) <= 0)) {
//         setError("Please enter a valid ml value for Beverages");
//         return;
//       }
//       const payload = {
//         name,
//         price: parseFloat(price),
//         category,
//         ...(category === "Beverages" && { ml: parseInt(ml) }),
//       };
//       await axios.post("/api/menu", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuForm({ name: "", price: "", category: "Veg", ml: "" });
//       setError("");
//       setSuccess("Menu item added successfully");
//       fetchMenu();
//     } catch (err) {
//       console.error("Add menu item error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to add menu item"
//       );
//     }
//   };

//   const handlePayBill = async (tableId) => {
//     try {
//       const token = localStorage.getItem("token");
//       const tableOrders = orders.filter(
//         (order) =>
//           order.tableId.toString() === tableId.toString() &&
//           order.billGenerated &&
//           !order.paid
//       );
//       if (tableOrders.length === 0) {
//         setError("No unpaid bills found for this table");
//         return;
//       }
//       for (const order of tableOrders) {
//         await axios.put(
//           `/api/orders/${order._id}/pay`,
//           {},
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//       }
//       setError("");
//       setSuccess("Bill paid successfully");
//       fetchTables();
//       fetchOrders();
//     } catch (err) {
//       console.error("Pay bill error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to pay bill"
//       );
//     }
//   };

//   const handleCreateAccount = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const { name, email, password, confirmPassword, role } = accountForm;
//       if (!name || !email || !password || !confirmPassword || !role) {
//         setError("All fields are required");
//         return;
//       }
//       if (password !== confirmPassword) {
//         setError("Passwords do not match");
//         return;
//       }
//       if (!["waiter", "kitchen"].includes(role)) {
//         setError("Invalid role selected");
//         return;
//       }
//       await axios.post(
//         "/api/auth/signup/reception",
//         { name, email, password, confirmPassword, role },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAccountForm({
//         name: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         role: "waiter",
//       });
//       setError("");
//       setSuccess(`Account created for ${name} (${role})`);
//     } catch (err) {
//       console.error("Create account error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to create account"
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

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "tables":
//         return (
//           <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">Tables</h2>
//               <div className="relative">
//                 <form onSubmit={handleAddTable} className="flex items-center">
//                   <input
//                     type="number"
//                     value={tableNumber}
//                     onChange={(e) => setTableNumber(e.target.value)}
//                     placeholder="Table Number"
//                     className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                   <button
//                     type="submit"
//                     className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
//                   >
//                     Add Table
//                   </button>
//                 </form>
//               </div>
//             </div>

//             {loading ? (
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//               </div>
//             ) : tables.length === 0 ? (
//               <div className="text-center py-10">
//                 <p className="text-gray-500 text-lg">No tables found.</p>
//                 <p className="text-gray-400">Add a table to get started.</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {tables.map((table) => {
//                   const tableOrders = orders.filter(
//                     (order) => order.tableId.toString() === table._id.toString()
//                   );
//                   const billGenerated = tableOrders.some(
//                     (order) => order.billGenerated
//                   );
//                   const isPaid =
//                     tableOrders.length > 0 &&
//                     tableOrders.every((order) => order.paid);

//                   let statusColor = "bg-gray-100";
//                   let statusText = "Available";

//                   if (tableOrders.length > 0) {
//                     if (isPaid) {
//                       statusColor = "bg-green-100";
//                       statusText = "Paid";
//                     } else if (billGenerated) {
//                       statusColor = "bg-yellow-100";
//                       statusText = "Bill Generated";
//                     } else {
//                       statusColor = "bg-blue-100";
//                       statusText = "Occupied";
//                     }
//                   }

//                   return (
//                     <div
//                       key={table._id}
//                       className={`${statusColor} rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl`}
//                     >
//                       <div className="p-4">
//                         <div className="flex justify-between items-center mb-3">
//                           <h3 className="text-xl font-bold text-gray-800">
//                             Table {table.tableNumber}
//                           </h3>
//                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-opacity-50 text-gray-800">
//                             {statusText}
//                           </span>
//                         </div>

//                         <div className="space-y-2 mb-4">
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Customer:</span>
//                             <span className="font-medium">{table.customerName || "Not Assigned"}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Waiter:</span>
//                             <span className="font-medium">{table.waiterId?.name || "Not Assigned"}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Total Bill:</span>
//                             <span className="font-medium">₹{table.totalBill.toFixed(2)}</span>
//                           </div>
//                         </div>

//                         <div className="mb-4">
//                           <h4 className="font-medium text-gray-700 mb-2">Orders:</h4>
//                           <div className="max-h-32 overflow-y-auto bg-white bg-opacity-50 rounded p-2">
//                             {tableOrders.length === 0 ? (
//                               <p className="text-gray-500 text-sm">No orders placed.</p>
//                             ) : (
//                               <ul className="space-y-1">
//                                 {tableOrders.map((order, index) => (
//                                   <li key={index} className="text-sm">
//                                     {order.items.map((item, idx) => (
//                                       <div key={idx} className="flex justify-between">
//                                         <span>
//                                           {item.name} x {item.quantity}
//                                           {item.ml ? ` (${item.ml} ml)` : ""}
//                                         </span>
//                                         <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200">
//                                           {order.status}
//                                         </span>
//                                       </div>
//                                     ))}
//                                   </li>
//                                 ))}
//                               </ul>
//                             )}
//                           </div>
//                         </div>

//                         <div className="flex justify-center">
//                           {!isPaid && billGenerated && (
//                             <button
//                               onClick={() => handlePayBill(table._id)}
//                               className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//                             >
//                               Pay Bill
//                             </button>
//                           )}
//                           {isPaid && (
//                             <button
//                               onClick={() => handleDeleteTable(table._id)}
//                               className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//                             >
//                               Delete Table
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         );

//       case "menu":
//         return (
//           <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Menu Item</h2>
//                 <form onSubmit={handleAddMenuItem} className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Name
//                     </label>
//                     <input
//                       type="text"
//                       value={menuForm.name}
//                       onChange={(e) =>
//                         setMenuForm({ ...menuForm, name: e.target.value })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Price
//                     </label>
//                     <input
//                       type="number"
//                       value={menuForm.price}
//                       onChange={(e) =>
//                         setMenuForm({ ...menuForm, price: e.target.value })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Category
//                     </label>
//                     <select
//                       value={menuForm.category}
//                       onChange={(e) =>
//                         setMenuForm({ ...menuForm, category: e.target.value, ml: "" })
//                       }
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     >
//                       <option value="Veg">Veg</option>
//                       <option value="Non-Veg">Non-Veg</option>
//                       <option value="Drinks">Drinks</option>
//                       <option value="Beverages">Beverages</option>
//                     </select>
//                   </div>
//                   {menuForm.category === "Beverages" && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Milliliters (ml)
//                       </label>
//                       <input
//                         type="number"
//                         value={menuForm.ml}
//                         onChange={(e) =>
//                           setMenuForm({ ...menuForm, ml: e.target.value })
//                         }
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                         required
//                       />
//                     </div>
//                   )}
//                   <button
//                     type="submit"
//                     className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
//                   >
//                     Add Menu Item
//                   </button>
//                 </form>
//               </div>

//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu Items</h2>
//                 {menuItems.length === 0 ? (
//                   <div className="text-center py-10">
//                     <p className="text-gray-500 text-lg">No menu items found.</p>
//                     <p className="text-gray-400">Add items to get started.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {["Veg", "Non-Veg", "Drinks", "Beverages"].map((category) => {
//                       const items = menuItems.filter(
//                         (item) => item.category === category
//                       );
//                       if (items.length === 0) return null;

//                       let categoryColor;
//                       switch (category) {
//                         case "Veg": categoryColor = "bg-green-100 text-green-800"; break;
//                         case "Non-Veg": categoryColor = "bg-red-100 text-red-800"; break;
//                         case "Drinks": categoryColor = "bg-blue-100 text-blue-800"; break;
//                         case "Beverages": categoryColor = "bg-purple-100 text-purple-800"; break;
//                         default: categoryColor = "bg-gray-100 text-gray-800";
//                       }

//                       return (
//                         <div key={category} className="bg-white rounded-lg shadow-md p-4">
//                           <h3 className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColor} mb-3`}>
//                             {category}
//                           </h3>
//                           <div className="grid grid-cols-1 gap-2">
//                             {items.map((item) => (
//                               <div key={item._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
//                                 <span className="font-medium">{item.name}</span>
//                                 <div className="flex items-center">
//                                   {item.ml && (
//                                     <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full mr-2">
//                                       {item.ml} ml
//                                     </span>
//                                   )}
//                                   <span className="font-bold text-purple-600">
//                                     ₹{item.price.toFixed(2)}
//                                   </span>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       case "accounts":
//         return (
//           <div className="bg-white rounded-lg shadow-lg p-6 animate-fadeIn">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
//             <form onSubmit={handleCreateAccount} className="max-w-md mx-auto">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Name
//                   </label>
//                   <input
//                     type="text"
//                     value={accountForm.name}
//                     onChange={(e) =>
//                       setAccountForm({ ...accountForm, name: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     value={accountForm.email}
//                     onChange={(e) =>
//                       setAccountForm({ ...accountForm, email: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     value={accountForm.password}
//                     onChange={(e) =>
//                       setAccountForm({ ...accountForm, password: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Confirm Password
//                   </label>
//                   <input
//                     type="password"
//                     value={accountForm.confirmPassword}
//                     onChange={(e) =>
//                       setAccountForm({
//                         ...accountForm,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Role
//                   </label>
//                   <div className="flex space-x-4">
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         checked={accountForm.role === "waiter"}
//                         onChange={() => setAccountForm({ ...accountForm, role: "waiter" })}
//                         className="h-4 w-4 text-purple-600 focus:ring-purple-500"
//                       />
//                       <span className="ml-2 text-gray-700">Waiter</span>
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         checked={accountForm.role === "kitchen"}
//                         onChange={() => setAccountForm({ ...accountForm, role: "kitchen" })}
//                         className="h-4 w-4 text-purple-600 focus:ring-purple-500"
//                       />
//                       <span className="ml-2 text-gray-700">Kitchen</span>
//                     </label>
//                   </div>
//                 </div>
//                 <button
//                   type="submit"
//                   className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
//                 >
//                   Create Account
//                 </button>
//               </div>
//             </form>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
//       {/* Notification */}
//       {(error || success) && (
//         <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
//           } transition-all duration-500 transform animate-fadeIn`}>
//           <p className="font-medium">{error || success}</p>
//         </div>
//       )}

//       {/* Header */}
//       <header className="bg-white shadow-md">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <h1 className="text-2xl font-bold text-purple-700">Reception Dashboard</h1>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Navigation Tabs */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
//         <div className="bg-white rounded-lg shadow-md p-1 flex space-x-1">
//           <button
//             onClick={() => setActiveTab("tables")}
//             className={`flex-1 py-3 px-4 rounded-md text-center font-medium transition-colors duration-200 ${activeTab === "tables"
//                 ? "bg-purple-600 text-white"
//                 : "hover:bg-purple-100 text-gray-700"
//               }`}
//           >
//             Tables
//           </button>
//           <button
//             onClick={() => setActiveTab("menu")}
//             className={`flex-1 py-3 px-4 rounded-md text-center font-medium transition-colors duration-200 ${activeTab === "menu"
//                 ? "bg-purple-600 text-white"
//                 : "hover:bg-purple-100 text-gray-700"
//               }`}
//           >
//             Menu
//           </button>
//           <button
//             onClick={() => setActiveTab("accounts")}
//             className={`flex-1 py-3 px-4 rounded-md text-center font-medium transition-colors duration-200 ${activeTab === "accounts"
//                 ? "bg-purple-600 text-white"
//                 : "hover:bg-purple-100 text-gray-700"
//               }`}
//           >
//             Accounts
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {renderTabContent()}
//       </main>
//     </div>
//   );
// };

// export default ReceptionDashboard;

// ************************************************************

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "../api";
import { QRCodeSVG } from "qrcode.react";

const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [activeTab, setActiveTab] = useState("tables");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    price: "",
    category: "Veg",
    ml: "",
    description: "",
  });
  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "waiter",
  });

  const fetchTables = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) throw new Error("Token expired");
      if (decoded.role.toLowerCase() !== "reception")
        throw new Error("Invalid role");

      const response = await axios.get("/api/tables", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort tables by tableNumber in ascending order
      const sortedTables = response.data.sort(
        (a, b) => a.tableNumber - b.tableNumber
      );
      setTables(sortedTables);
    } catch (err) {
      console.error("Fetch tables error:", err);
      setError(
        err.message || err.response?.data?.message || "Failed to fetch tables"
      );
      if (
        err.message === "No token found" ||
        err.message === "Token expired" ||
        err.message === "Invalid role"
      ) {
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.get("/api/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data);
    } catch (err) {
      console.error("Fetch menu error:", err);
      setError(
        err.message || err.response?.data?.message || "Failed to fetch menu"
      );
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.get("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(
        err.message || err.response?.data?.message || "Failed to fetch orders"
      );
    }
  };

  useEffect(() => {
    fetchTables();
    fetchMenu();
    fetchOrders();
    const interval = setInterval(() => {
      fetchTables();
      fetchMenu();
      fetchOrders();
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!tableNumber || isNaN(tableNumber) || parseInt(tableNumber) < 1) {
        setError("Please enter a valid table number");
        return;
      }
      await axios.post(
        "/api/tables",
        { tableNumber: parseInt(tableNumber) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTableNumber("");
      setError("");
      setSuccess("Table added successfully");
      fetchTables();
    } catch (err) {
      console.error("Add table error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to add table"
      );
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError("");
      setSuccess("Table deleted successfully");
      fetchTables();
    } catch (err) {
      console.error("Delete table error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete table"
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { name, price, category, ml, description } = menuForm;
      if (!name || !price || isNaN(price) || parseFloat(price) <= 0) {
        setError("Please enter a valid name and price");
        return;
      }
      if (category === "Beverages" && (!ml || isNaN(ml) || parseInt(ml) <= 0)) {
        setError("Please enter a valid ml value for Beverages");
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", parseFloat(price));
      formData.append("category", category);
      formData.append("description", description);
      if (category === "Beverages") {
        formData.append("ml", parseInt(ml));
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await axios.post("/api/menu", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });
      
      setMenuForm({ name: "", price: "", category: "Veg", ml: "", description: "" });
      setSelectedImage(null);
      setImagePreview(null);
      setError("");
      setSuccess("Menu item added successfully");
      fetchMenu();
    } catch (err) {
      console.error("Add menu item error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to add menu item"
      );
    }
  };

  const handlePayBill = async (tableId) => {
    try {
      const token = localStorage.getItem("token");
      const tableOrders = orders.filter(
        (order) =>
          order.tableId.toString() === tableId.toString() &&
          order.billGenerated &&
          !order.paid
      );
      if (tableOrders.length === 0) {
        setError("No unpaid bills found for this table");
        return;
      }
      for (const order of tableOrders) {
        await axios.put(
          `/api/orders/${order._id}/pay`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setError("");
      setSuccess("Bill paid successfully");
      fetchTables();
      fetchOrders();
    } catch (err) {
      console.error("Pay bill error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to pay bill"
      );
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { name, email, password, confirmPassword, role } = accountForm;
      if (!name || !email || !password || !confirmPassword || !role) {
        setError("All fields are required");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!["waiter", "kitchen"].includes(role)) {
        setError("Invalid role selected");
        return;
      }
      await axios.post(
        "/api/auth/signup/reception",
        { name, email, password, confirmPassword, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccountForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "waiter",
      });
      setError("");
      setSuccess(`Account created for ${name} (${role})`);
    } catch (err) {
      console.error("Create account error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to create account"
      );
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "/api/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/signin", { replace: true });
    }
  };

  const generateQRCode = (item) => {
    setSelectedMenuItem(item);
    setShowQRCode(true);
  };

  const closeQRModal = () => {
    setShowQRCode(false);
    setSelectedMenuItem(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "tables":
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Tables</h2>
              <div className="w-full md:w-auto">
                <form onSubmit={handleAddTable} className="flex items-center">
                  <input
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table Number"
                    className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-r-xl hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Add Table
                  </button>
                </form>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <p className="text-gray-500 text-xl mt-4">No tables found.</p>
                <p className="text-gray-400 mt-2">Add a table to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => {
                  const tableOrders = orders.filter(
                    (order) => order.tableId.toString() === table._id.toString()
                  );
                  const billGenerated = tableOrders.some(
                    (order) => order.billGenerated
                  );
                  const isPaid =
                    tableOrders.length > 0 &&
                    tableOrders.every((order) => order.paid);

                  let statusColor = "bg-gray-50 border-gray-200";
                  let statusText = "Available";
                  let statusBadge = "bg-gray-100 text-gray-800";

                  if (tableOrders.length > 0) {
                    if (isPaid) {
                      statusColor = "bg-green-50 border-green-200";
                      statusText = "Paid";
                      statusBadge = "bg-green-100 text-green-800";
                    } else if (billGenerated) {
                      statusColor = "bg-yellow-50 border-yellow-200";
                      statusText = "Bill Generated";
                      statusBadge = "bg-yellow-100 text-yellow-800";
                    } else {
                      statusColor = "bg-blue-50 border-blue-200";
                      statusText = "Occupied";
                      statusBadge = "bg-blue-100 text-blue-800";
                    }
                  }

                  return (
                    <div
                      key={table._id}
                      className={`${statusColor} rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border`}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-2xl font-bold text-gray-800">
                            Table {table.tableNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="space-y-3 mb-5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Customer:</span>
                            <span className="font-medium">{table.customerName || "Not Assigned"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Waiter:</span>
                            <span className="font-medium">{table.waiterId?.name || "Not Assigned"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Bill:</span>
                            <span className="font-medium text-lg">₹{table.totalBill.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mb-5">
                          <h4 className="font-medium text-gray-700 mb-2">Orders:</h4>
                          <div className="max-h-40 overflow-y-auto bg-white rounded-lg p-3 border border-gray-100 shadow-inner">
                            {tableOrders.length === 0 ? (
                              <p className="text-gray-500 text-sm">No orders placed.</p>
                            ) : (
                              <ul className="space-y-2">
                                {tableOrders.map((order, index) => (
                                  <li key={index} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center">
                                        <span className="font-medium">
                                          {item.name} x {item.quantity}
                                          {item.ml ? ` (${item.ml} ml)` : ""}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          order.status === "Completed" ? "bg-green-100 text-green-800" :
                                          order.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                                          "bg-yellow-100 text-yellow-800"
                                        }`}>
                                          {order.status}
                                        </span>
                                      </div>
                                    ))}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-center">
                          {!isPaid && billGenerated && (
                            <button
                              onClick={() => handlePayBill(table._id)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
                            >
                              Pay Bill
                            </button>
                          )}
                          {isPaid && (
                            <button
                              onClick={() => handleDeleteTable(table._id)}
                              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                            >
                              Delete Table
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "menu":
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Add Menu Item</h2>
                <form onSubmit={handleAddMenuItem} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={menuForm.name}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={menuForm.description}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, description: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={menuForm.price}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, price: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={menuForm.category}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, category: e.target.value, ml: "" })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                  
                  {menuForm.category === "Beverages" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Milliliters (ml)
                      </label>
                      <input
                        type="number"
                        value={menuForm.ml}
                        onChange={(e) =>
                          setMenuForm({ ...menuForm, ml: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Image
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-300">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {!imagePreview ? (
                            <>
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p className="mt-1 text-sm text-gray-500">
                                <span className="font-medium">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </>
                          ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img 
                                src={imagePreview || "/placeholder.svg"} 
                                alt="Preview" 
                                className="max-h-28 max-w-full object-contain" 
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  setSelectedImage(null);
                                  setImagePreview(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium"
                  >
                    Add Menu Item
                  </button>
                </form>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Menu Items</h2>
                {menuItems.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p className="text-gray-500 text-xl mt-4">No menu items found.</p>
                    <p className="text-gray-400 mt-2">Add items to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                    {["Veg", "Non-Veg", "Drinks", "Beverages"].map((category) => {
                      const items = menuItems.filter(
                        (item) => item.category === category
                      );
                      if (items.length === 0) return null;

                      let categoryColor;
                      switch (category) {
                        case "Veg": categoryColor = "bg-green-100 text-green-800"; break;
                        case "Non-Veg": categoryColor = "bg-red-100 text-red-800"; break;
                        case "Drinks": categoryColor = "bg-blue-100 text-blue-800"; break;
                        case "Beverages": categoryColor = "bg-purple-100 text-purple-800"; break;
                        default: categoryColor = "bg-gray-100 text-gray-800";
                      }

                      return (
                        <div key={category} className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                          <h3 className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColor} mb-4`}>
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            {items.map((item) => (
                              <div key={item._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-all duration-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                      <img 
                                        src={item.imageUrl || "/placeholder.svg"} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-800">{item.name}</span>
                                    {item.description && (
                                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {item.ml && (
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                      {item.ml} ml
                                    </span>
                                  )}
                                  <span className="font-bold text-purple-600 whitespace-nowrap">
                                    ₹{item.price.toFixed(2)}
                                  </span>
                                  <button
                                    onClick={() => generateQRCode(item)}
                                    className="p-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors duration-200"
                                    title="Generate QR Code"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "accounts":
        return (
          <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Create Account</h2>
            <form onSubmit={handleCreateAccount} className="max-w-md mx-auto bg-gray-50 p-8 rounded-xl border border-gray-200">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={accountForm.password}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm({
                        ...accountForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center justify-center p-4 border border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-purple-500 hover:shadow-md">
                      <input
                        type="radio"
                        checked={accountForm.role === "waiter"}
                        onChange={() => setAccountForm({ ...accountForm, role: "waiter" })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 hidden"
                      />
                      <div className={`flex flex-col items-center ${accountForm.role === "waiter" ? "text-purple-600" : "text-gray-700"}`}>
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <span className="font-medium">Waiter</span>
                      </div>
                      {accountForm.role === "waiter" && (
                        <div className="absolute top-0 right-0 h-4 w-4 bg-purple-600 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
                      )}
                    </label>
                    <label className="flex items-center justify-center p-4 border border-gray-300 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:border-purple-500 hover:shadow-md">
                      <input
                        type="radio"
                        checked={accountForm.role === "kitchen"}
                        onChange={() => setAccountForm({ ...accountForm, role: "kitchen" })}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 hidden"
                      />
                      <div className={`flex flex-col items-center ${accountForm.role === "kitchen" ? "text-purple-600" : "text-gray-700"}`}>
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <span className="font-medium">Kitchen</span>
                      </div>
                      {accountForm.role === "kitchen" && (
                        <div className="absolute top-0 right-0 h-4 w-4 bg-purple-600 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
                      )}
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Notification */}
      {(error || success) && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          } transition-all duration-500 transform animate-fadeIn flex items-center`}>
          {error ? (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
          <p className="font-medium">{error || success}</p>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRCode && selectedMenuItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">QR Code for {selectedMenuItem.name}</h3>
              <button 
                onClick={closeQRModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
              <QRCodeSVG 
                value={JSON.stringify({
                  id: selectedMenuItem._id,
                  name: selectedMenuItem.name,
                  price: selectedMenuItem.price,
                  category: selectedMenuItem.category,
                  ...(selectedMenuItem.ml && { ml: selectedMenuItem.ml })
                })}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={true}
              />
              <div className="mt-4 text-center">
                <p className="font-medium text-gray-800">{selectedMenuItem.name}</p>
                <p className="text-purple-600 font-bold">₹{selectedMenuItem.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  // In a real app, this would download the QR code
                  setSuccess("QR Code downloaded successfully");
                  closeQRModal();
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Reception Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-md p-1 flex space-x-1">
          <button
            onClick={() => setActiveTab("tables")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${activeTab === "tables"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "hover:bg-purple-50 text-gray-700"
              }`}
          >
            Tables
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${activeTab === "menu"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "hover:bg-purple-50 text-gray-700"
              }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${activeTab === "accounts"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                : "hover:bg-purple-50 text-gray-700"
              }`}
          >
            Accounts
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default ReceptionDashboard;