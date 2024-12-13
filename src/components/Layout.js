const Layout = ({ children }) => (
    <div className="min-h-screen bg-custom-black text-custom-white">
      <header className="p-4">
        {/* Navigation */}
      </header>
      <main>{children}</main>
      <footer className="p-4">
        {/* Footer */}
      </footer>
    </div>
  );
  
  export default Layout;
  