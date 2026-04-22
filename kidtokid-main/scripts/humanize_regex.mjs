import fs from 'fs';
import path from 'path';

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
            // Tratamento de erros e mensagens
            .replace(/Ocorreu um erro/g, 'Ups! Ocorreu um problema')
            .replace(/Erro ao /g, 'Ups! Problema ao ')
            .replace(/Não foi possível/g, 'Infelizmente não conseguimos')
            .replace(/NÃ£o conseguimos enviar/g, 'Ups! Não conseguimos enviar')
            .replace(/Não conseguimos enviar a mensagem/g, 'Ups! A mensagem não seguiu')
            .replace(/Tente novamente/g, 'Tenta novamente')
            .replace(/Por favor preencha/g, 'Por favor, preenche')
            .replace(/Contacte o suporte/g, 'Fala connosco')
            .replace(/Inicia sessão para/gi, 'Entra na tua conta para')
            .replace(/Inicia sessÃ£o para/gi, 'Entra na tua conta para')

            // Institucional (tu vs. voce)
            .replace(/ou seja, você/gi, 'ou seja, tu')
            .replace(/ou seja, vocÃª/gi, 'ou seja, tu')
            .replace(/Ao fazer uma encomenda, está a aceitar/gi, 'Ao fazeres uma encomenda, estás a aceitar')
            .replace(/Ao fazer uma encomenda, estÃ¡ a aceitar/gi, 'Ao fazeres uma encomenda, estás a aceitar')
            .replace(/em que faz a encomenda/gi, 'em que fazes a encomenda')
            .replace(/está a confirmar que leu/g, 'estás a confirmar que leste')
            .replace(/estÃ¡ a confirmar que leu/g, 'estás a confirmar que leste')
            .replace(/devolvemos-lhe/g, 'devolvemos-te')
            .replace(/Contacte-nos/g, 'Fala connosco')
            .replace(/contacte-nos/g, 'fala connosco')
            .replace(/Traga os/g, 'Traz os')
            .replace(/Traga-nos/g, 'Traz-nos')
            .replace(/lhe dar/g, 'te dar')
            .replace(/ao seu dispor/g, 'ao teu dispor')
            .replace(/o seu carrinho/gi, 'o teu carrinho')
            .replace(/a sua encomenda/gi, 'a tua encomenda')
            .replace(/As suas encomendas/gi, 'As tuas encomendas')
            .replace(/A sua encomenda/gi, 'A tua encomenda')
            .replace(/o seu pedido/gi, 'o teu pedido');

        if (content !== updated) {
            fs.writeFileSync(filePath, updated, 'utf8');
            console.log('Humanizado com sucesso: ' + filePath);
        }
    }
});
