// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "../api";

// const SignUp = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { name, email, password, confirmPassword } = form;
//       if (!name || !email || !password || !confirmPassword) {
//         setError("All fields are required");
//         return;
//       }
//       if (password !== confirmPassword) {
//         setError("Passwords do not match");
//         return;
//       }
//       const response = await axios.post("/api/auth/signup", {
//         name,
//         email,
//         password,
//         confirmPassword,
//       });
//       localStorage.setItem("token", response.data.token);
//       setError("");
//       setSuccess("Account created successfully");
//       setTimeout(() => {
//         navigate("/reception", { replace: true });
//       }, 1000);
//     } catch (err) {
//       console.error("Signup error:", err);
//       setError(
//         err.response?.data?.message || err.message || "Failed to create account"
//       );
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {success && <p className="text-green-500 mb-4">{success}</p>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Name
//             </label>
//             <input
//               type="text"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
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
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
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
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
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
//               value={form.confirmPassword}
//               onChange={(e) =>
//                 setForm({ ...form, confirmPassword: e.target.value })
//               }
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Sign Up
//           </button>
//         </form>
//         <p className="mt-4 text-center">
//           Already have an account?{" "}
//           <Link to="/signin" className="text-blue-500 hover:underline">
//             Sign In
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SignUp;



import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // For floating animation elements
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    // Create random floating bubbles
    const generateBubbles = () => {
      const newBubbles = [];
      for (let i = 0; i < 15; i++) {
        newBubbles.push({
          id: i,
          size: Math.random() * 60 + 20,
          left: Math.random() * 100,
          animationDuration: Math.random() * 15 + 10,
          delay: Math.random() * 5,
          opacity: Math.random() * 0.15 + 0.05
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { name, email, password, confirmPassword } = form;
      if (!name || !email || !password || !confirmPassword) {
        setError("All fields are required");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      const response = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
        confirmPassword,
      });
      localStorage.setItem("token", response.data.token);
      setError("");
      setSuccess("Account created successfully");
      setTimeout(() => {
        navigate("/reception", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to create account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating bubbles/elements */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: '-10%',
            opacity: bubble.opacity,
            animation: `float ${bubble.animationDuration}s ease-in-out infinite`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10 bg-white/80 backdrop-blur-lg p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-blue-200">
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500 rounded-full opacity-20" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-indigo-500 rounded-full opacity-20" />

        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Create Account</h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-white/50 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium px-4 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
