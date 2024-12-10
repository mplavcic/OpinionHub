# OpinionHub

<img src="https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes/mvc_express.png" width="500" height="300" alt="Arhitektura">

**Routes**:<br>

 these should be avaliable without login
 /<br>
 /login<br> 
 /signup<br> 
 /surveys<br>
 /survey/:id<br>
 /survey/:id/take<br>
 
 all protected routes start with /home<br>
 /home<br> 
 /home/surveys/create<br>
 /home/my-surveys/:id <br>

**Controllers**:<br>
 
 index<br>

 user_create_post<br>
 user_login_post<br>
 user_logout<br>
 
 survey_list<br>
 survey_detail<br>
 survey_create_get<br>
 survey_create_post<br>
 survey_take_get<br>
 survey_take_post<br>
 user_survey_list<br>
 user_survey_detail<br>

 **Views**:<br>
 
 layout
 layout_home

 index
 login
 signup
 home

 survey_create
 survey_detail
 survey_list
 survey_take
 user_survey_detail
 user_surveys

 



