var isClose=true;
        const stopwords = ["of", "the", "a", "an", "any", "is", "can", "who", "what", "why", "whom"];
        var editor = "sorts\n" +
            "    #books = {harry_potter, lord_of_the_rings, to_kill_a_mockingbird, the_hobbit}.\n"+
            "    #authors = {j_k_rowling, j_r_r_tolkien, harper_lee}.\n" +
            "    #genres = {fantasy, fiction}.\n" +
            "    #people = {john, sarah, nikhil}.\n" +
            "predicates\n" +
            "    bookAuthor(#books, #authors).\n" +
            "    bookGenre(#books, #genres).\n" +
            "    bookAvailable(#books).\n" +
            "    bookCheckedOut(#books, #people).\n" +
            "    person(#people).\n" +
            "rules\n" +
            "    bookAuthor(harry_potter, j_k_rowling).\n" + 
            "    bookAuthor(lord_of_the_rings, j_r_r_tolkien).\n" +
            "    bookAuthor(to_kill_a_mockingbird, harper_lee).\n" +
            "    bookAuthor(the_hobbit, j_r_r_tolkien).\n" +
            "    bookGenre(harry_potter, fantasy).\n" +
            "    bookGenre(lord_of_the_rings, fantasy).\n" +
            "    bookGenre(to_kill_a_mockingbird, fiction).\n" +
            "    bookGenre(the_hobbit, fantasy).\n" +
            "    bookAvailable(harry_potter).\n" +
            "    bookAvailable(lord_of_the_rings).\n" +
            "    bookAvailable(to_kill_a_mockingbird).\n" +
            "    bookAvailable(the_hobbit).\n" +
            "    bookCheckedOut(lord_of_the_rings, john).\n" +
            "    bookCheckedOut(to_kill_a_mockingbird, sarah).\n" +
            "    person(john).\n" +
            "    person(sarah).";

        var contstring = editor.split("sorts\n")[1].split("predicates\n");
        var sortstring = contstring[0].split('.');
        sortstring.splice(-1, 1);
        var sorts = {};
        sortstring = sortstring.map(d => d.replace(/\n/g, '').trim()).forEach(d => {
            var par = d.split("=");
            sorts[par[0].replace(/#/, '').trim()] = par[1].replace(/{|}/g, '').split(',').map(w => w.trim())
        });
        // predicates
        var predicates = {};
        contstring = contstring[1].split("rules\n");
        sortstring = contstring[0].split('.');
        sortstring.splice(-1, 1);
        sortstring.forEach(d => {
            var part = d.replace(/\n/g, '').trim().split('(');
            var func = part[0];
            predicates[func] = {};
            var par = part[1].split(',').map(e => e.replace(/#|\)/g, '').trim());
            var par1 = sorts[par[0]].slice();
            par1.push("X");
            par.splice(0, 1);
            par1.forEach(e => {
                var strinh = (e == 'X' ? '' : (e + ' ')) + func;
                predicates[func][strinh] = func + "(" + e + ")";
                par.forEach(par2 => {
                    var temp = sorts[par2].slice();
                    temp.push("X");
                    temp.forEach(t => {
                        var strinh = (e == 'X' ? '' : (e + ' ')) + func + (t == 'X' ? '' : (' ' + t));
                        // if (strinh != fubnc)
                        predicates[func][strinh] = func + "(" + e + "," + t + ")";
                    })
                });
            });
        });


        var all_predicates = [];
        for (var key1 in predicates) {
            if (predicates.hasOwnProperty(key1)) {
                for (var key2 in predicates[key1]) {
                    if (predicates[key1].hasOwnProperty(key2))
                        all_predicates.push(key2);
                }
            }

        }
        all_predicates.push('speak spanish'); // extra terms
        a = FuzzySet(all_predicates);
      
      console.log(all_predicates)
      
      
      // Speech recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';

      // Get DOM elements
      const answerDiv = document.querySelector('#answer');
      const voiceBtn = document.getElementById('voice-input-btn');
      const textInput = document.getElementById('text-input');
      const submitBtn = document.getElementById('submit-btn');
      const answerBox = document.getElementById('answer-box');

      submitBtn.addEventListener('click', () => {
        const question = textInput.value;
        if (question.trim() === '') {
          answerBox.innerHTML = 'Please ask a question.';
          return;
        }
        var trim_script = question.split(" ");
        trim_script = trim_script.filter(f => !stopwords.includes(f));
        var queryQues = a.get(trim_script.join(" "), null, 0.5); 
        getAnswer(queryQues);
        
      });

      // Handle speech recognition
      recognition.onresult = event => {
        const resultIndex = event.resultIndex;
        const transcript = event.results[resultIndex][0].transcript;
        textInput.value = transcript;
        
        var trim_script = transcript.split(" ");
        trim_script = trim_script.filter(f => !stopwords.includes(f));
        var queryQues = a.get(trim_script.join(" "), null, 0.5);
        console.log(queryQues);
        getAnswer(queryQues);
      };

      // Handle click on voice input button     
      function startSpeechRecognition() {
        recognition.start();
      }
      voiceBtn.addEventListener('click', startSpeechRecognition);


      function getAnswer(question) {
        
        if (question!=null) {
                var mainkey = question[0][1].replace('speak ','');
                var answerarr = mainkey.split(' ');
                var key1 = '';
                answerarr.forEach(d => {
                    key1 = (predicates[d] != undefined) ? d : key1;
                });
                //var key1 = answerarr.length>2? answerarr[1]:answerarr[0];
                var key2 = mainkey;
                console.log(key1 +'-'+ key2);
                console.log(predicates[key1][key2]);
                
                var data = {
                    'action': "getQuery",
                    'query': predicates[key1][key2],
                    'editor': editor
                };
          
          console.log(data)
          
          
          
          $.ajax({
          url: "https://cors-anywhere.herokuapp.com/http://wave.ttu.edu/ajax.php",
          type: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          },
          data: {
            action: "getQuery",
            query: predicates[key1][key2],
            editor: editor
          },
          success: function(response) {
            console.log(response);
             const answer = response || 'Sorry, I could not find an answer.';
             answerDiv.innerHTML = answer;
             answerBox.innerHTML = answer;
          },
          error: function(xhr, status, error) {
            console.log("error: " + error);
          }
        });
      }


          
          //$.post("http://localhost/ajax.php", { url: "http://wave.ttu.edu/" , data:data}, function (response) {
                // Expected response : answer sets
                //$.post("http://localhost/ajax/ajax.js",  function (response) {
                //$.post("http://localhost/ajaxtest.php", function (response) {  
                 // $.post("https://cors-anywhere.herokuapp.com/http://wave.ttu.edu/", data, function (response) {
                  
                   // console.log(response);
                  
                  
                   // var html = document.createElement("html");
                   // html.innerHTML = response;
                    // contentRan
                   // var answerstring = html.querySelector("p").textContent.replace(/X =/gm, "");
                  //  var answerarr = answerstring.split("\n");
                  //  answerarr.splice(-1,1);
                 //   console.log(answerarr);
                 //   var pre_string = "The answer to your question " + transcript + " is ";
                 //   answerstring = contentRan.answer[answerarr[0].toLowerCase().trim()]==undefined?
                 //       (pre_string + (answerarr.length==1?answerstring:(answerarr.splice(-1, 0, "and"),answerarr.join())))
                 //       : generaspeak(contentRan.answer[answerarr[0].toLowerCase().trim()]);
                //    console.log(answerstring);
                  
                //   const answer = answerstring || 'Sorry, I could not find an answer.';
               //   answerDiv.innerHTML = answer;
               //   answerBox.innerHTML = answer;
               //   console.log(answer);
                    
               // });
            
        }
        
 

