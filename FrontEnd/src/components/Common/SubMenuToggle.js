import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";

const SubMenuToggle = () => {
  const ActiveClass = (id, className = "active") => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle(className);
    }
  };

  // Usage in click handlers
  const closeSubMenu = () => {
    ActiveClass("overlaymenu");
    ActiveClass("body");
    ActiveClass("submenu-icon");
    ActiveClass("sub-menu-wrap");
  };

  // useEffect(() => {
  //     const handleResize = () => {
  //         const width = window.innerWidth;

  //         const handleClick = (e) => {
  //             const menuItems = document.getElementsByClassName("ant-menu-item");
  //             const overlaymenu = document.getElementById("overlaymenu");

  //             const menuItemsArray = Array.from(menuItems);
  //             const menuItemClicked = menuItemsArray.some((menuItem) =>
  //                 menuItem.contains(e.target)
  //             );

  //             if (menuItemClicked) {
  //                 // if (menuButton) {
  //                 //     menuButton.classList.remove("active");
  //                 // }

  //                 // if (overlayMenu) {
  //                 //     overlayMenu.classList.remove("active");
  //                 // }
  //                 //Console.log('if click')

  //                 if (overlaymenu.classList.contains('active')) {
  //                     ActiveClass('overlaymenu');
  //                 } else {
  //                     ActiveClass('overlaymenu');
  //                 }
  //                 ActiveClass('overlaymenu');
  //                 ActiveClass('body');
  //                 ActiveClass('submenu-icon');
  //                 ActiveClass('sub-menu-wrap');

  //             }
  //             else{
  //                 //Console.log('else')

  //                 if (overlaymenu.classList.contains('active')) {
  //                     ActiveClass('overlaymenu');
  //                 } else {
  //                     ActiveClass('overlaymenu');
  //                 }
  //                 ActiveClass('overlaymenu');
  //                 ActiveClass('body');
  //                 ActiveClass('submenu-icon');
  //                 ActiveClass('sub-menu-wrap');
  //             }
  //         };

  //         if (width <= 767) {
  //             window.addEventListener("click", handleClick);
  //         } else {
  //             window.removeEventListener("click", handleClick);
  //         }

  //         // Clean up event listener on component unmount
  //         return () => {
  //             window.removeEventListener("click", handleClick);
  //         };
  //     };

  //     handleResize();
  //     window.addEventListener("resize", handleResize);

  //     return () => {
  //         window.removeEventListener("resize", handleResize);
  //     };
  // }, []);
  return (
    <>
      <div className="icon" id="submenu-icon" onClick={closeSubMenu}>
        <CaretLeftOutlined className="left" />
        <CaretRightOutlined className="right" />
      </div>
    </>
  );
};

export default SubMenuToggle;
