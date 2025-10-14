import React from "react";
import { useUser } from "../../hooks/useUser";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, loading, isInitialized } = useUser();

  // Si pas encore initialisé ou en cours de chargement, afficher un loader
  if (!isInitialized || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-lg text-gray-600 mt-4">Chargement...</div>
      </div>
    );
  }

  // Si pas d'utilisateur, laisser PrivateRoute gérer la redirection
  if (!user) {
    return null;
  }

  return (
    <div className="">
      <Navbar activeMenu={activeMenu} />
      <div className="flex">
        <div className="max-[1088px]:hidden">
          <SideMenu activeMenu={activeMenu} />
        </div>
        <div className="grow mx-5">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;