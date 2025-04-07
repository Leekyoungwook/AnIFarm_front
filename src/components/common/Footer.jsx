import React from "react";
import AnifarmLogo from "../../assets/main/aniform.png";

const Footer = () => {

  return (
    <footer className="flex items-center md:justify-center border-t w-full h-32 md:h-24">
      <div className="w-full flex-1 md:max-w-7xl px-0 md:px-4">
        <div className="flex flex-col md:flex-row justify-between items-center w-full h-full">
          {/* 로고 및 주소 정보 */}
          <div className="flex items-center">
            <img src={AnifarmLogo} alt="Logo" className="w-[40px] mr-4 ml-2" />
            <p className="text-sm text-gray-600 text-left">
              (08503) 서울 금천구 가산디지털2로 144 현대테라타워 가산DK A동 20층
              <br className="hidden md:block" />
              대표전화: 02-2038-0800 | FAX: 02-000-0000
            </p>
          </div>
          {/* 저작권 정보 */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Copyright © 2025 AnIfarm All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
