// import React from "react";
// import { motion } from "framer-motion";

// interface AlternatingSectionProps {
//   children: React.ReactNode;
//   background?: string;
//   image?: string | null;
//   icon?: React.ReactNode;
//   reverse?: boolean;
//   hideOnMobile?: boolean;
//   delay?: number;
// }

// export default function AlternatingSection({
//   children,
//   background = "#25D366",
//   image = null,
//   icon = null,
//   reverse = false,
//   hideOnMobile = false,
//   delay = 0,
// }: AlternatingSectionProps) {
//   const variants = {
//     hidden: { 
//       opacity: 0, 
//       y: 50 
//     },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut",
//         delay
//       }
//     }
//   };

//   return (
//     <motion.div
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.1 }}
//       variants={variants}
//       className={`flex flex-col md:flex-row items-center justify-between w-full py-12 px-6 md:px-12 ${
//         reverse ? "md:flex-row-reverse" : ""
//       }`}
//     >
//       {/* Cuadro decorativo */}
//       {!hideOnMobile && (
//         <motion.div
//           variants={{
//             hidden: { 
//               opacity: 0, 
//               scale: 0.8,
//               x: reverse ? 50 : -50
//             },
//             visible: { 
//               opacity: 1, 
//               scale: 1,
//               x: 0,
//               transition: {
//                 duration: 0.6,
//                 ease: "easeOut",
//                 delay: delay + 0.2
//               }
//             }
//           }}
//           className={`w-full md:w-1/3 h-40 md:h-64 flex items-center justify-center rounded-2xl mb-6 md:mb-0 ${
//             reverse ? "md:ml-8" : "md:mr-8"
//           }`}
//           style={{
//             background: image
//               ? `url(${image}) center/cover no-repeat`
//               : background,
//           }}
//         >
//           {icon && !image && <span className="text-6xl text-white">{icon}</span>}
//         </motion.div>
//       )}

//       {/* Contenido */}
//       <motion.div
//         variants={{
//           hidden: { 
//             opacity: 0, 
//             x: reverse ? -50 : 50
//           },
//           visible: { 
//             opacity: 1, 
//             x: 0,
//             transition: {
//               duration: 0.6,
//               ease: "easeOut",
//               delay: delay + 0.3
//             }
//           }
//         }}
//         className="w-full md:w-2/3 text-center md:text-left"
//       >
//         {children}
//       </motion.div>
//     </motion.div>
//   );
// }

import React from "react";
import { motion } from "framer-motion";

interface AlternatingSectionProps {
  children: React.ReactNode;
  background?: string;
  image?: string | null;
  icon?: React.ReactNode;
  reverse?: boolean;
  hideOnMobile?: boolean;
  delay?: number;
}

export default function AlternatingSection({
  children,
  background = "#25D366",
  image = null,
  icon = null,
  reverse = false,
  hideOnMobile = false,
  delay = 0,
}: AlternatingSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut", delay }
    }
  };

  const decorVariants = {
    hidden: { opacity: 0, scale: 0.85, x: reverse ? 50 : -50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut", delay: delay + 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: reverse ? -50 : 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.6, ease: "easeOut", delay: delay + 0.3 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ 
        once: true, 
        amount: 0.1,
        margin: "0px 0px -100px 0px"
      }}
      variants={containerVariants}
      className={`flex flex-col md:flex-row items-center justify-between w-full py-16 px-6 md:px-12 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Cuadro decorativo */}
      {!hideOnMobile && (
        <motion.div
          variants={decorVariants}
          className={`w-full md:w-1/3 h-48 md:h-64 flex items-center justify-center rounded-3xl mb-8 md:mb-0 shadow-lg ${
            reverse ? "md:ml-8" : "md:mr-8"
          }`}
          style={{
            background: image 
              ? `url(${image}) center/cover no-repeat` 
              : `linear-gradient(135deg, ${background}99, ${background}CC)`,
          }}
        >
          {icon && !image && (
            <span className="text-7xl md:text-8xl text-white opacity-90">{icon}</span>
          )}
        </motion.div>
      )}

      {/* Contenido */}
      <motion.div
        variants={contentVariants}
        className="w-full md:w-2/3 text-center md:text-left"
      >
        <div className="p-4 md:p-0 bg-white md:bg-transparent rounded-xl md:rounded-none shadow-md md:shadow-none">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}