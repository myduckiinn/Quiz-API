import express from "express";

const app = express();

app.use(express.json());

const usuarios =[
    { id: 1, nome: "jão" },
    { id: 2, nome: "Liz" }
];

const quizzes = [
    { id: 1, titulo: "Quiz de JavaScript" },
    { id: 2, titulo: "Quiz de História" }
];

const perguntas = [
    { id: 1, quiz_id: 1, texto: "O que é JavaScript?" },
    { id: 2, quiz_id: 1, texto: "O que é uma variável?" }
];

const alternativas = [
    { id: 1, pergunta_id: 1, texto: "Uma linguagem de programação", correta: true },
    { id: 2, pergunta_id: 1, texto: "Um banco de dados", correta: false },
    { id: 3, pergunta_id: 1, texto: "Um sistema operacional", correta: false },
    { id: 4, pergunta_id: 1, texto: "Um navegador", correta: false }
];

const tentativas = [
    { id: 1, usuario_id: 1, quiz_id: 1, pontuacao: 0 }
];

const respostas = [];

app.get("/tentativas", (req, res) => {

    res.json(tentativas);

});

app.get("/tentativas/:id", (req, res) => {

    const id = Number(req.params.id);

    const tentativa = tentativas.find(tentativa => tentativa.id === id);

    res.json(tentativa);

});

app.post("/tentativas", (req, res) => {

    const usuario_id = Number(req.body.usuario_id);
    const quiz_id = Number(req.body.quiz_id);

    const usuario = usuarios.find(
        usuario => usuario.id === usuario_id
    );

    const quiz = quizzes.find(
        quiz => quiz.id === quiz_id
    );

    if (!usuario || !quiz) {
        return res.status(400).json({
            mensagem: "Usuário ou quiz não encontrado"
        });
    }

    const tentativasDoUsuario = tentativas.filter(
        tentativa => tentativa.usuario_id === usuario_id && tentativa.quiz_id === quiz_id
    );

    if (tentativasDoUsuario.length >= 3) {
        return res.status(400).json({
            mensagem: "Limite de tentativas atingido"
        });
    }

    const novaTentativa = {
        id: tentativas.length + 1,
        usuario_id: usuario_id,
        quiz_id: quiz_id,
        pontuacao: 0
    };

    tentativas.push(novaTentativa);

    res.json(novaTentativa);

});

app.get("/respostas", (req, res) => {

    res.json(respostas);

});

app.get("/respostas/:id", (req, res) => {

    const id = Number(req.params.id);

    const resposta = respostas.find(resposta => resposta.id === id);

    res.json(resposta);

});

app.post("/respostas", (req, res) => {

    const alternativa_id = Number(req.body.alternativa_id);
    const tentativa_id = Number(req.body.tentativa_id);
    const pergunta_id = Number(req.body.pergunta_id);

    const alternativa = alternativas.find(
        alternativa => alternativa.id === alternativa_id
    );

    const tentativa = tentativas.find(
        tentativa => tentativa.id === tentativa_id
    );

    if (!alternativa || !tentativa) {
        return res.status(400).json({
            mensagem: "Alternativa ou tentativa não encontrada"
        });
    }

    if (alternativa.pergunta_id !== pergunta_id) {
        return res.status(400).json({
            mensagem: "A alternativa não pertence à pergunta"
        });
    }

    const respostaExistente = respostas.find(
        resposta => resposta.tentativa_id === tentativa_id && resposta.pergunta_id === pergunta_id
    );

    if (respostaExistente) {
        return res.status(400).json({
            mensagem: "Essa pergunta já foi respondida nessa tentativa"
        });
    }

    const novaResposta = {
        id: respostas.length + 1,
        tentativa_id: tentativa_id,
        pergunta_id: pergunta_id,
        alternativa_id: alternativa_id
    };

    respostas.push(novaResposta);

    if (alternativa.correta) {
        tentativa.pontuacao += 1;
    }

    res.json(novaResposta);

});

app.get("/ranking", (req, res) => {

    const ranking = usuarios.map(usuario => {

        const tentativasDoUsuario = tentativas.filter(
            tentativa => tentativa.usuario_id === usuario.id
        );

        const pontuacao = tentativasDoUsuario.reduce(
            (total, tentativa) => total + tentativa.pontuacao,
            0
        );

        return {
            usuario_id: usuario.id,
            nome: usuario.nome,
            pontuacao: pontuacao
        };

    });

    ranking.sort((a, b) => b.pontuacao - a.pontuacao);

    res.json(ranking);

});

app.get("/quizzes/:quiz_id/ranking", (req, res) => {

    const quiz_id = Number(req.params.quiz_id);

    const ranking = usuarios.map(usuario => {

        const tentativasDoUsuario = tentativas.filter(
            tentativa => tentativa.usuario_id === usuario.id && tentativa.quiz_id === quiz_id
        );

        const pontuacao = tentativasDoUsuario.reduce(
            (total, tentativa) => total + tentativa.pontuacao,
            0
        );

        return {
            usuario_id: usuario.id,
            nome: usuario.nome,
            pontuacao: pontuacao
        };

    });

    ranking.sort((a, b) => b.pontuacao - a.pontuacao);

    res.json(ranking);

});

app.get("/usuarios", (req, res) => {

    res.json(usuarios);

});

app.get("/usuarios/:id", (req, res) => {

    const id = Number(req.params.id);

    const usuario = usuarios.find(usuario => usuario.id === id);

    res.json(usuario);

});

app.post("/usuarios", (req, res) => {

    const novoUsuario = {
        id: usuarios.length + 1,
        nome: req.body.nome
    };

    usuarios.push(novoUsuario);

    res.json(novoUsuario);

});

app.put("/usuarios/:id", (req, res) => {

    const id = Number(req.params.id);

    const usuario = usuarios.find(usuario => usuario.id === id);

    usuario.nome = req.body.nome;

    res.json(usuario);

});

app.delete("/usuarios/:id", (req, res) => {

    const id = Number(req.params.id);

    const indice = usuarios.findIndex(usuario => usuario.id === id);

    usuarios.splice(indice, 1);

    res.json({ mensagem: "Usuário deletado" });

});

app.get("/quizzes", (req, res) => {

    res.json(quizzes);

});

app.get("/quizzes/:id", (req, res) => {

    const id = Number(req.params.id);

    const quiz = quizzes.find(quiz => quiz.id === id);

    res.json(quiz);

});

app.post("/quizzes", (req, res) => {

    const novoQuiz = {
        id: quizzes.length + 1,
        titulo: req.body.titulo
    };

    quizzes.push(novoQuiz);

    res.json(novoQuiz);

});

app.put("/quizzes/:id", (req, res) => {

    const id = Number(req.params.id);

    const quiz = quizzes.find(quiz => quiz.id === id);

    quiz.titulo = req.body.titulo;

    res.json(quiz);

});

app.delete("/quizzes/:id", (req, res) => {

    const id = Number(req.params.id);

    const indice = quizzes.findIndex(quiz => quiz.id === id);

    quizzes.splice(indice, 1);

    res.json({ mensagem: "Quiz deletado" });

});

app.get("/quizzes/:quiz_id/perguntas", (req, res) => {

    const quiz_id = Number(req.params.quiz_id);

    const perguntasDoQuiz = perguntas.filter(pergunta => pergunta.quiz_id === quiz_id);

    res.json(perguntasDoQuiz);

});

app.get("/quizzes/:quiz_id/perguntas/:id", (req, res) => {

    const quiz_id = Number(req.params.quiz_id);
    const id = Number(req.params.id);

    const pergunta = perguntas.find(
        pergunta => pergunta.id === id && pergunta.quiz_id === quiz_id
    );

    res.json(pergunta);

});

app.post("/quizzes/:quiz_id/perguntas", (req, res) => {

    const quiz_id = Number(req.params.quiz_id);

    const novaPergunta = {
        id: perguntas.length + 1,
        quiz_id: quiz_id,
        texto: req.body.texto
    };

    perguntas.push(novaPergunta);

    res.json(novaPergunta);

});

app.put("/quizzes/:quiz_id/perguntas/:id", (req, res) => {

    const quiz_id = Number(req.params.quiz_id);
    const id = Number(req.params.id);

    const pergunta = perguntas.find(
        pergunta => pergunta.id === id && pergunta.quiz_id === quiz_id
    );

    pergunta.texto = req.body.texto;

    res.json(pergunta);

});

app.delete("/quizzes/:quiz_id/perguntas/:id", (req, res) => {

    const quiz_id = Number(req.params.quiz_id);
    const id = Number(req.params.id);

    const indice = perguntas.findIndex(
        pergunta => pergunta.id === id && pergunta.quiz_id === quiz_id
    );

    perguntas.splice(indice, 1);

    res.json({ mensagem: "Pergunta deletada" });

});

app.get("/quizzes/:quiz_id/perguntas/:pergunta_id/alternativas", (req, res) => {

    const pergunta_id = Number(req.params.pergunta_id);

    const alternativasDaPergunta = alternativas
        .filter(alternativa => alternativa.pergunta_id === pergunta_id)
        .map(alternativa => ({
            id: alternativa.id,
            pergunta_id: alternativa.pergunta_id,
            texto: alternativa.texto
        }));

    res.json(alternativasDaPergunta);

});

app.get("/quizzes/:quiz_id/perguntas/:pergunta_id/alternativas/:id", (req, res) => {

    const pergunta_id = Number(req.params.pergunta_id);
    const id = Number(req.params.id);

    const alternativa = alternativas.find(
        alternativa => alternativa.id === id && alternativa.pergunta_id === pergunta_id
    );

    if (alternativa) {
        res.json({
            id: alternativa.id,
            pergunta_id: alternativa.pergunta_id,
            texto: alternativa.texto
        });
    } else {
        res.json(alternativa);
    }

});

app.post("/quizzes/:quiz_id/perguntas/:pergunta_id/alternativas", (req, res) => {

    const pergunta_id = Number(req.params.pergunta_id);

    const alternativasDaPergunta = alternativas.filter(
        alternativa => alternativa.pergunta_id === pergunta_id
    );

    if (alternativasDaPergunta.length >= 4) {
        return res.status(400).json({
            mensagem: "Uma pergunta pode ter no máximo 4 alternativas"
        });
    }

    const novaAlternativa = {
        id: alternativas.length + 1,
        pergunta_id: pergunta_id,
        texto: req.body.texto,
        correta: req.body.correta
    };

    alternativas.push(novaAlternativa);

    res.json({
        id: novaAlternativa.id,
        pergunta_id: novaAlternativa.pergunta_id,
        texto: novaAlternativa.texto
    });

});

app.put("/quizzes/:quiz_id/perguntas/:pergunta_id/alternativas/:id", (req, res) => {

    const pergunta_id = Number(req.params.pergunta_id);
    const id = Number(req.params.id);

    const alternativa = alternativas.find(
        alternativa => alternativa.id === id && alternativa.pergunta_id === pergunta_id
    );

    alternativa.texto = req.body.texto;
    alternativa.correta = req.body.correta;

    res.json({
        id: alternativa.id,
        pergunta_id: alternativa.pergunta_id,
        texto: alternativa.texto
    });

});

app.delete("/quizzes/:quiz_id/perguntas/:pergunta_id/alternativas/:id", (req, res) => {

    const pergunta_id = Number(req.params.pergunta_id);
    const id = Number(req.params.id);

    const alternativasDaPergunta = alternativas.filter(
        alternativa => alternativa.pergunta_id === pergunta_id
    );

    if (alternativasDaPergunta.length <= 2) {
        return res.status(400).json({
            mensagem: "Uma pergunta deve ter no mínimo 2 alternativas"
        });
    }

    const indice = alternativas.findIndex(
        alternativa => alternativa.id === id && alternativa.pergunta_id === pergunta_id
    );

    alternativas.splice(indice, 1);

    res.json({ mensagem: "Alternativa deletada" });

});

app.get("/", (req, res) => {
    res.send("API quiz funcionando!");
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});