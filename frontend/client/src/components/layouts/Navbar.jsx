import React, { useState } from "react";
import SideMenu from "./SideMenu";
import { HiOutlineX, HiOutlineMenu } from "react-icons/hi";
import { UserContext } from "../../context/UserProvider";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);


  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200/80 backdrop-blur-[2px] py-4 px-4">
      <div className="flex items-center gap-5">
        <button
          className="block lg:hidden text-black"
          onClick={() => {
            setOpenSideMenu(!openSideMenu);
          }}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>
        <h2 className="text-lg font-medium text-black">Task Manager</h2>
      </div>

      

      {/* Mobile side menu */}
      {openSideMenu && (
        <div className="fixed top-[61px] left-0 z-50 bg-white border-r border-gray-200 h-screen">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;