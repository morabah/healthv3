/**
 * Footer Component
 * A responsive footer with navigation links and copyright information
 */
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns?: FooterColumn[];
  showCopyright?: boolean;
  copyrightText?: string;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  columns = [],
  showCopyright = true,
  copyrightText,
  className = ''
}) => {
  const year = new Date().getFullYear();
  const defaultCopyrightText = `© ${year} Health Appointment System. All rights reserved.`;

  return (
    <footer className={`bg-gray-100 border-t border-gray-200 ${className}`}>
      <div className="container-custom mx-auto px-4 py-8">
        {columns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {columns.map((column, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        {showCopyright && (
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              {copyrightText || defaultCopyrightText}
            </p>
            <p className="text-sm text-gray-500 mt-2 md:mt-0">
              Made with <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" /> for better healthcare
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
