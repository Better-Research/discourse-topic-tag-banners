import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed, observer } from "@ember/object";
import Topic from "discourse/models/topic";

export default Component.extend({
  router: service(),

  init() {
    this._super(...arguments);
    this.setTopic();
  },

  fullNameChanged: observer('router.currentRoute', function() {
    this.setTopic();
  }),

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

    return this.topic && this.topic.tags.length > 0 && !hideMobile && route.parent.name == "topic";
  },

  @computed("topic")
  get tags() {
    const tags = [];

    if (!this.topic || this.topic.tags.length <= 0) {
      return tags;
    }

    this.topic.tags.forEach((tag) => {
      tags.push({
        name: tag,
        description: this.topic.tags_descriptions[tag]
      })
    })

    return tags;
  }
});