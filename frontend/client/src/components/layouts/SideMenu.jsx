"use client"

import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/UserProvider"
import { useNavigate } from "react-router-dom"
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data"

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext)
  const [sideMenuData, setSideMenuData] = useState([])
  const navigate = useNavigate()

  const handleMenuClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route)
  }

  const handleLogout = () => {
    clearUser();
    navigate("/login")
  }

  useEffect(() => {
    if (user) {
      setSideMenuData(user?.role === 'admin' ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA)
    }
  }, [user])

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative">
          <img
            src={user?.profile || ""}
            alt="profile"
            className="w-20 h-20 bg-slate-400 rounded-full object-cover"
          />
        </div>
        {user?.role === 'admin' && (
          <div className="text-[10px] font-medium text-white bg-blue-600 px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}
        <h5 className="text-gray-950 font-medium leading-6 mt-3">
          {user?.name || ""}
        </h5>
        <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
      </div>
      
      {sideMenuData.map((item, index) => (
        <button 
          key={`menu_${index}`} 
          onClick={() => handleMenuClick(item.route)}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu === item.label 
              ? "text-blue-600 bg-gradient-to-r from-blue-50/40 to-blue-100/50 border-r-3 border-blue-600"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          } py-3 px-6 mb-3 cursor-pointer transition-colors`}
        >
          <item.icon className="text-xl" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default SideMenu