# Starter #

Boilerplate для разработки проектов.

### Структура ###

* Таск раннер - [Gulp](http://gulpjs.com/)
* Сервер - [Express](http://expressjs.com/ru/guide/routing.html)
* Препроцессор [Less](http://lesscss.org/)
* Шаблонизатор [Nunjucks](https://mozilla.github.io/nunjucks/)

#### Роутинг ####

По дефолту роут прописан только для индексной страницы.
Для того чтобы создать свой роут, используем файл 'routes/index.js'.

*Например:* Если нам нужно создать страницу новости, то сначала создаем шаблон в папке /views с именем 'news.html'
Затем идем в 'routes/index.js' и пишем следующий код
``` 
router.get('/news', function(req, res, next) {
  res.render('news', { ctx: global.siteDB });
});
 ```