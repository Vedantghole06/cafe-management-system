// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "../api/axios";

// const Signin = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const response = await axios.post("/api/auth/signin", {
//         email,
//         password,
//       });
//       console.log("Signin response:", response.data);
//       const { token } = response.data;
//       if (!token) {
//         throw new Error("No token received from server");
//       }
//       localStorage.removeItem("token");
//       localStorage.setItem("token", token);
//       const decoded = jwtDecode(token);
//       console.log("Decoded token after signin:", decoded);
//       const role = decoded.role.toLowerCase();
//       if (role === "reception") {
//         navigate("/reception");
//       } else if (role === "waiter") {
//         navigate("/waiter");
//       } else if (role === "kitchen") {
//         navigate("/kitchen");
//       } else {
//         throw new Error("Invalid role");
//       }
//     } catch (err) {
//       console.error("Signin error:", err, {
//         status: err.response?.status,
//         data: err.response?.data,
//       });
//       setError(err.response?.data?.message || "Signin failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6">Sign In</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
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
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Sign In
//           </button>
//           {error && <p className="text-red-500 mt-4">{error}</p>}
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Signin;



import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "../api/axios";

const Signin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation state
  const [floatingElements, setFloatingElements] = useState([]);

  // Generate floating elements on component mount
  useEffect(() => {
    const generateFloatingElements = () => {
      const shapes = [];
      const colors = ['bg-blue-400', 'bg-purple-400', 'bg-indigo-400', 'bg-teal-400', 'bg-cyan-300'];
      const types = ['circle', 'square', 'triangle'];

      for (let i = 0; i < 15; i++) {
        const size = Math.floor(Math.random() * 40) + 10; // 10-50px
        const left = Math.floor(Math.random() * 100);
        const top = Math.floor(Math.random() * 100);
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 15; // 15-25s
        const color = colors[Math.floor(Math.random() * colors.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const opacity = Math.random() * 0.3 + 0.1; // 0.1-0.4

        shapes.push({ size, left, top, delay, duration, color, type, opacity });
      }

      setFloatingElements(shapes);
    };

    generateFloatingElements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/signin", {
        email,
        password,
      });
      console.log("Signin response:", response.data);
      const { token } = response.data;
      if (!token) {
        throw new Error("No token received from server");
      }
      localStorage.removeItem("token");
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      console.log("Decoded token after signin:", decoded);
      const role = decoded.role.toLowerCase();
      if (role === "reception") {
        navigate("/reception");
      } else if (role === "waiter") {
        navigate("/waiter");
      } else if (role === "kitchen") {
        navigate("/kitchen");
      } else {
        throw new Error("Invalid role");
      }
    } catch (err) {
      console.error("Signin error:", err, {
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.message || "Signin failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Render the shape based on type
  const renderShape = (shape) => {
    if (shape.type === 'circle') {
      return (
        <div
          className={`absolute rounded-full ${shape.color} opacity-${Math.floor(shape.opacity * 10)}`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            animation: `float ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      );
    } else if (shape.type === 'square') {
      return (
        <div
          className={`absolute ${shape.color} opacity-${Math.floor(shape.opacity * 10)}`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            animation: `float ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
            transform: `rotate(${Math.random() * 45}deg)`,
          }}
        />
      );
    } else {
      // Triangle (using CSS)
      return (
        <div
          className={`absolute ${shape.color} opacity-${Math.floor(shape.opacity * 10)}`}
          style={{
            width: 0,
            height: 0,
            borderLeft: `${shape.size / 2}px solid transparent`,
            borderRight: `${shape.size / 2}px solid transparent`,
            borderBottom: `${shape.size}px solid currentColor`,
            left: `${shape.left}%`,
            top: `${shape.top}%`,
            animation: `float ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animation keyframes */}
      <style>
        {`
          @keyframes float {
            0% {
              transform: translateY(0) rotate(0);
            }
            50% {
              transform: translateY(-20px) rotate(10deg);
            }
            100% {
              transform: translateY(0) rotate(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
          
          .input-focus-effect:focus-within {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-glow:hover {
            box-shadow: 0 0 15px 3px rgba(59, 130, 246, 0.6);
          }
        `}
      </style>

      {/* Floating background elements */}
      {floatingElements.map((shape, index) => (
        <div key={index}>
          {renderShape(shape)}
        </div>
      ))}

      {/* Login card with glassmorphism */}
      <div className="glass-effect p-8 rounded-2xl shadow-2xl w-full max-w-md z-10 transition-all duration-300 hover:shadow-blue-500/20">
        <div className="text-center mb-8 relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 animation-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mt-6">Welcome Back</h1>
          <p className="text-gray-600 mt-2 text-lg">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center border-l-4 border-red-500 transition-all duration-300 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="transition-all duration-300 input-focus-effect">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border-0 focus:outline-none focus:ring-0"
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="transition-all duration-300 input-focus-effect">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-3 py-3 w-full border-0 focus:outline-none focus:ring-0"
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all duration-300 transform hover:-translate-y-1 btn-glow ${isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signin;