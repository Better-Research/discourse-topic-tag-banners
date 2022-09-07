import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed, observer } from "@ember/object";
import Topic from "discourse/models/topic";
import { ajax } from 'discourse/lib/ajax';
import { tracked } from "@glimmer/tracking";
  
class AsyncData {
  @tracked state = 'loading';
  @tracked value = [];

  get isLoading() {
    return this.state == 'loading';
  }

  get isLoaded() {
    return this.state === 'loaded';
  }

  resolve(value) {
    this.state = 'loaded';
    this.value = value;
  }
}

export default Component.extend({


  router: service(),

  init() {
    this._super(...arguments);
    this.setTopic();
    this.papers = [];
    this.data = new AsyncData();
  },

  fullNameChanged: observer("router.currentRoute", function () {
    this.setTopic();
    this.data.state = 'loading';
  }),
  fetchPapers(result) {
      if (result.tags.length > 0) {
        var arr = [];
        result.tags.forEach((elm) => {
          ajax("/paper_store/" + elm + ".json").then((data) => {
            if(!data.hasOwnProperty("error")) {
              var data_json = JSON.parse(data["result"]);
              if (data_json != null) {
                var authors = JSON.parse(data_json["authors"]).join(", ");
                
                arr.push({
                  name: elm,
                  authors: authors,
                  description: data_json["title"],
                  url: "https://eprint.iacr.org/" + elm.replace("-", "/") + ".pdf"
                })
                if(arr.length == result.tags.length) {
                  this.papers = arr;
                  this.data.resolve(this.papers);
                }

              }
            }
          });
        });
      }

      return this.data;
  }
  ,
  setTopic() {
    const route = this.router.currentRoute;
    
    if (route.parent.name == "topic" && route.parent.params.id) {
      Topic.find(route.parent.params.id, {}).then((result) => {
        this.set("topic", result);
        
      });
    }
  },

  @computed("topic", "router.currentRoute")
  get canShow() {
    const route = this.router.currentRoute;
    const hideMobile =
      !settings.show_on_mobile && this.site.mobileView ? true : false;

    return (
      this.topic &&
      this.topic.tags &&
      this.topic.tags.length > 0 &&
      !hideMobile &&
      route.parent.name == "topic"
    );
  },

  @computed("topic")
  get tags() {
    
    // const tags = [];
    // var cnt = 0;

    // if (!this.topic || this.topic.tags.length <= 0) {
    //   return new AsyncData();
    // }
    if(this.data.state == 'loading') {
      return this.fetchPapers(this.topic);
    }
    else {
      return this.data;
    }
    
    // this.topic.tags.forEach((tag) =>  {
      
    //   var authors = ""
    //   ajax("/paper_store/" + tag + ".json").then(response =>  {
    //     return response
    //   }).then(data => {
    //       if(!data.hasOwnProperty("error")) {
    //         var data_json = JSON.parse(data["result"]);
    //         if (data_json != null) {
    //           authors = JSON.parse(data_json["authors"]).join(", ");
              
    //           tags.push({
    //             name: tag,
    //             authors: authors,
    //             description: this.topic.tags_descriptions[tag],
    //             url: "https://eprint.iacr.org/" + tag.replace("-", "/") + ".pdf"
    //           })
    //           cnt+=1;
    //         }
    //       }
    //     });
    // });
    
    //return tags;
    // return tags;
    // if (!this.topic || this.topic.tags.length <= 0) {
    //   console.log("hello");
    //   return [];
    // }
    
    // return Promise.all(this.topic.tags.map((tag) => {
    //   console.log(tag);
    //   var authors = ""
    //   return ajax("/paper_store/" + tag + ".json").then(response =>  {
    //     return response
    //   }).then(data => {
    //       if(!data.hasOwnProperty("error")) {
    //         var data_json = JSON.parse(data["result"]);
    //         if (data_json != null) {
    //           authors = JSON.parse(data_json["authors"]).join(", ");
    //           return {
    //             name: tag,
    //             authors: authors,
    //             description: this.topic.tags_descriptions[tag],
    //             url: "https://eprint.iacr.org/" + tag.replace("-", "/") + ".pdf"
    //           }
    //         }
    //       }
    //     });
    // }))
    
  },
});