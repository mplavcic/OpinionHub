# OpinionHub

<img src="https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes/mvc_express.png" width="500" height="200" alt="Arhitektura">

File struktura je izgenerirana sa express-generator.

Sve sta klijent vidi nalazi se u **`/views`** i **`/public`** direktorijima. **`/views`** sadrzi `.pug` fileove.  
Pug je tzv template engine, nekakav "mix" html-a i klasicnog programskog jezika sa petljama, ifovima, itd, i sluzi  
za dinamicno kreairanje html-ova koji su razliciti ovisno o nekin uvjetima itd. Ovo se dogadja na serveru. Ako imate  
prijedlog za neku drugu frontend tehnologiju, dajte slobodno. U **`/public`** su css, slike i js skripte.  

Cila aplikacija koja definirana je u `app.js` fileu a skripta koja digne HTTP server sa tom aplikacijom u  
**`/www/bin`**. Aplikacija registrirane rute, koje su definirane u **`/routes`**, te funkcionalnosti koje  
moze obavljati ovisno o kojoj ruti se radi i kakvom HTTP zahtjevu i one su definirane u **`/controllers`**.
Kontroleri pisu ili citaju iz baze, sklepaju dinamicno neki html i onda ga posalju nazad ("renderaju") ka  
HTTP odgovor. Za bazu koristimo MongoDB, objektna baza a ne relacijska, prakticki nemamo tablice nego kole-  
kciju "dokumenata". Modeli za bazu su definirani u **`/models`**. Mozemo gledat model ka tablicu a do dokument  
ka red. U trenutnoj implementaciji spajamo se na bazu u cloudu, mongodb attlas.

Ako ocete sami probat kod: (LINUX/MACOS/UNIX)
  - kloniraj repo, odi u repo
  - izmini u **`app.js`** url baze na mongodb atlasu (odi prvo na stranicu napravi bazu, itd)
  - npm install
  - npm run ime_skripte (pogledaj moguce skripte pod "scripts" u `package.json`)
  - odi u browser i isprobaj rute

localhost:3000  
localhost:3000/login  
localhost:3000/signup



