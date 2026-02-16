export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="text-sm">
                    &copy; {new Date().getFullYear()} Devia Store. Todos os direitos reservados.
                </div>
                <div className="footer-links">
                    <a href="#" className="footer-link">Termos</a>
                    <a href="#" className="footer-link">Privacidade</a>
                    <a href="#" className="footer-link">Contato</a>
                </div>
            </div>
        </footer>
    );
}
