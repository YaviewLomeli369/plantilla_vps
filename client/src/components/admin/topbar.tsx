import { useAuth } from "@/hooks/use-auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 🎨 Centralizamos estilos aquí
const styles = {
  nav: "bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50",
  container: "px-6 lg:px-8",
  inner: "flex items-center justify-between h-16",
  logoWrapper: "flex items-center space-x-4",
  logo: "flex items-center space-x-3",
  logoIcon: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center",
  title: "text-xl font-semibold text-gray-900",
  subtitle: "hidden md:flex items-center space-x-2 text-sm text-gray-500",
  actions: "flex items-center space-x-4",
  notificationBtn: "relative",
  bell: "h-5 w-5 text-gray-400",
  badge: "absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full",
  userWrapper: "flex items-center space-x-3",
  userText: "text-right hidden sm:block",
  username: "text-sm font-medium text-gray-900",
  role: "text-xs text-gray-500 capitalize",
  avatar: "w-9 h-9",
  avatarFallback: "bg-secondary text-white",
};

export function AdminTopbar() {
  const { user } = useAuth();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.inner}>

          {/* Logo + título */}
          <div className={styles.logoWrapper}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <i className="fas fa-cube text-white"></i>
              </div>
              <h1 className={styles.title}>Sistema Modular</h1>
            </div>
            <div className={styles.subtitle}>
              <span>Panel de Administración</span>
            </div>
          </div>

          {/* Acciones (notificación + usuario) */}
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" className={styles.notificationBtn}>
              <Bell className={styles.bell} />
              <span className={styles.badge}></span>
            </Button>

            <div className={styles.userWrapper}>
              <div className={styles.userText}>
                <p className={styles.username}>{user?.username}</p>
                <p className={styles.role}>{user?.role}</p>
              </div>
              <Avatar className={styles.avatar}>
                <AvatarFallback className={styles.avatarFallback}>
                  {user?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}




// import { useAuth } from "@/hooks/use-auth";
// import { Bell } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// export function AdminTopbar() {
//   const { user } = useAuth();

//   return (
//     <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
//       <div className="px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-3">
//               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
//                 <i className="fas fa-cube text-white"></i>
//               </div>
//               <h1 className="text-xl font-semibold text-gray-900">Sistema Modular</h1>
//             </div>
//             <div className="hidden md:flex items-center space-x-2">
//               <span className="text-sm text-gray-500">Panel de Administración</span>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <Button variant="ghost" size="sm" className="relative">
//               <Bell className="h-5 w-5 text-gray-400" />
//               <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
//             </Button>
            
//             <div className="flex items-center space-x-3">
//               <div className="text-right hidden sm:block">
//                 <p className="text-sm font-medium text-gray-900">{user?.username}</p>
//                 <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
//               </div>
//               <Avatar className="w-9 h-9">
//                 <AvatarFallback className="bg-secondary text-white">
//                   {user?.username?.substring(0, 2).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }
