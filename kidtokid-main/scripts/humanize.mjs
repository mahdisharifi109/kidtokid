import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, regex, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(regex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

const dir = 'src';
function walkDir(d, callback) {
    fs.readdirSync(d).forEach(f => {
        let dirPath = path.join(d, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(d, f));
    });
}

walkDir(dir, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = content
            // Tratamento de erros e mensagens (Tirar a frieza robótica)
            .replaceAll('Ocorreu um erro', 'Ups! Ocorreu um problema')
            .replaceAll('Erro ao ', 'Ups! Problema ao ')
            .replaceAll('Não foi possível', 'Infelizmente não conseguimos')
            .replaceAll('Não conseguimos enviar a mensagem', 'Ups! A mensagem não seguiu')
            .replaceAll('Tente novamente', 'Tenta novamente')
            .replaceAll('Por favor preencha', 'Por favor, preenche')
            .replaceAll('Contacte o suporte', 'Fala connosco')
            .replaceAll('Inicia sessão para', 'Entra na tua conta para')
            .replaceAll('Faça o login', 'Entra na tua conta')
            .replaceAll('registo efetuado com sucesso', 'Yey! Conta criada com sucesso!')
            
            // Tratamento de tu vs voce (Páginas Institucionais)
            .replaceAll('ou seja, você', 'ou seja, tu')
            .replaceAll('Ao fazer uma encomenda, está a aceitar', 'Ao fazeres uma encomenda, estás a aceitar')
            .replaceAll('em que faz a encomenda', 'em que fazes a encomenda')
            .replaceAll('está a confirmar que leu', 'estás a confirmar que leste')
            .replaceAll('devolvemos-lhe', 'devolvemos-te')
            .replaceAll('Contacte-nos', 'Fala connosco')
            .replaceAll('contacte-nos', 'fala connosco')
            .replaceAll('Traga os', 'Traz os')
            .replaceAll('Traga-nos', 'Traz-nos')
            .replaceAll('lhe dar', 'te dar')
            .replaceAll('lhe fazemos', 'te fazemos')
            .replaceAll('ao seu dispor', 'ao teu dispor')
            .replaceAll('o seu carrinho', 'o teu carrinho')
            .replaceAll('os seus dados', 'os teus dados')
            .replaceAll('a sua encomenda', 'a tua encomenda')
            .replaceAll('As suas encomendas', 'As tuas encomendas')
            .replaceAll('A sua encomenda', 'A tua encomenda')
            .replaceAll('o seu pedido', 'o teu pedido');

        if (content !== updated) {
            fs.writeFileSync(filePath, updated, 'utf8');
            console.log('Humanizado: ' + filePath);
        }
    }
});
