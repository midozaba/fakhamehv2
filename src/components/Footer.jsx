import React from 'react';
import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '../utils/translations';

const Footer = ({ language }) => {
  const t = useTranslation(language);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-slate-400 to-blue-900 p-3 rounded-lg">
                <Car className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">AL FAKHAMA</h3>
                <p className="text-gray-400">car rental</p>
              </div>
            </div>
            <p className="text-gray-400">{t('aboutUs')}</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-slate-400" />
                <span>+962 79 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-slate-400" />
                <span>info@alfakhama.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-slate-400" />
                <span>Amman, Jordan</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('followUs')}</h4>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 cursor-pointer">
                <span className="text-white font-bold">f</span>
              </div>
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-300 cursor-pointer">
                <span className="text-white font-bold">t</span>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 cursor-pointer">
                <span className="text-white font-bold">ig</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2024 Al Fakhama Car Rental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;