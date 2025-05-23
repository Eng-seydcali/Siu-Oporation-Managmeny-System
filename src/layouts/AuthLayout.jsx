import { Outlet } from 'react-router-dom';

import logo from '../asstes/logo.png'

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side (Branding) */}
      <div className="bg-blue-600 text-white md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="max-w-md text-center">
          <img src={logo} alt="" className="h-30 w-40 mx-auto mb-6" />
          
          <h1 className="text-4xl font-bold mb-4">SIU Oporatiopn  Management System</h1>
          <p className="text-blue-100 mb-6">
            Efficiently manage university budgets, track expenses, and streamline the request process with our comprehensive budget management system.
          </p>
          <div className="space-y-4 text-left bg-blue-700/30 p-6 rounded-lg">
            <h2 className="text-xl font-medium mb-2">Key Features</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span> 
                <span>Streamlined budget creation and approval workflow</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span> 
                <span>Efficient request management tied to approved budgets</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span> 
                <span>Emergency funding request system</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span> 
                <span>Comprehensive reporting and analytics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side (Auth Forms) */}
      <div className="bg-white md:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;