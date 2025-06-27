import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="bg-black text-white py-10 border-t border-purple-500/20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                {/* Contact Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6 }}
                >
                    <h3 className="text-lg font-semibold mb-3">CONTACT</h3>
                    <p className="text-sm text-gray-400 mb-2">
                        Have a project in mind? Let's build it together.
                    </p>
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                        <Mail size={16} className="text-purple-400" />
                        <span>innoveloustechno@gmail.com</span> {/* Placeholder */}
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                        <Phone size={16} className="text-purple-400" />
                        <span>+92 334 9251936</span> {/* Placeholder */}
                    </div>
                </motion.div>

                {/* Links Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h3 className="text-lg font-semibold mb-3">LINKS</h3>
                    <ul className="text-sm text-gray-400 space-y-2">
                        <li>
                            <Link to="/" className="hover:text-purple-400 transition-all">Home</Link>
                        </li>
                        <li>
                            <Link to="/portfolio" className="hover:text-purple-400 transition-all">Our Work</Link>
                        </li>
                        <li>
                            <Link to="/place-order" className="hover:text-purple-400 transition-all">Book a Consultation</Link>
                        </li>
                    </ul>
                </motion.div>

                {/* Services / Info */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h3 className="text-lg font-semibold mb-3">SERVICES</h3>
                    <ul className="text-sm text-gray-400 space-y-2">
                        <li>Web Development</li>
                        <li>UI/UX Design</li>
                        <li>Brand Strategy</li>
                        <li>SEO & Optimization</li>
                        <li>Technical Consulting</li>
                    </ul>
                </motion.div>
            </div>

            {/* Bottom Footer */}
            <div className="text-center mt-10 text-sm text-gray-500">
                © 2024 <Link to="/admin" >Innovelous Tech</Link>. All rights reserved.
            </div>
        </footer>
    );
}
