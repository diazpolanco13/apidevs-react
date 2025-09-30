'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle, X } from 'lucide-react';

export function ConfirmEmailDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState({ title: '', description: '' });

  useEffect(() => {
    // Detectar si venimos de un registro exitoso
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('status');
    const status_description = searchParams.get('status_description');

    // Solo mostrar para el caso específico de "Cuenta Creada"
    if (status && status.includes('Cuenta Creada')) {
      setMessage({
        title: status,
        description: status_description || ''
      });
      setIsOpen(true);

      // Limpiar los parámetros de la URL sin recargar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Redirigir al inicio después de cerrar
    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop oscuro */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-apidevs-primary/50 rounded-2xl shadow-2xl shadow-apidevs-primary/20 max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        {/* Botón cerrar (X) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icono principal */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-apidevs-primary/20 blur-2xl rounded-full" />
            <div className="relative bg-gradient-to-r from-apidevs-primary to-green-400 p-4 rounded-full">
              <Mail className="w-12 h-12 text-black" />
            </div>
            <div className="absolute -top-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-gray-900 animate-bounce">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-apidevs-primary to-green-400 bg-clip-text text-transparent">
          {message.title}
        </h2>

        {/* Descripción */}
        <p className="text-gray-300 text-center mb-6 leading-relaxed">
          {message.description}
        </p>

        {/* Nota adicional */}
        <div className="bg-apidevs-primary/10 border border-apidevs-primary/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 text-center">
            💡 <strong className="text-white">Tip:</strong> Si no ves el correo, revisa tu carpeta de spam
          </p>
        </div>

        {/* Botón de acción */}
        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-apidevs-primary to-green-400 hover:from-green-400 hover:to-apidevs-primary text-black font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-apidevs-primary/50"
        >
          Entendido
        </button>

        {/* Texto inferior */}
        <p className="text-center text-gray-500 text-xs mt-4">
          Serás redirigido al inicio en un momento
        </p>
      </div>
    </div>
  );
}
