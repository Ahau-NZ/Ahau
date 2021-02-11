<template>
  <div>
    <v-container fluid v-if="collection">
      <!-- Collection Header -->
      <v-row v-if="!showStory">
        <v-col cols="12" xs="12" sm="12" md="9" class="pa-0">
          <v-row>
            <!-- Collection image -->
            <!-- order (image first if not mobile) -->
            <v-col :order="!mobile ? 1 : 2" cols="12" xs="12" sm="12" md="2">
              <v-img :src="image" class="pa-0" cover height="100%" width="100%">
              </v-img>
            </v-col>
            <!-- Collection title-->
            <!-- order (title first if not mobile) -->
            <v-col :order="!mobile ? 2 : 1" cols="12" xs="12" sm="12" md="9">
              <v-row class="align-center pl-3">
                <h3 class="blue-grey--text text--darken-4">
                  {{ collection.name }}
                </h3>
                <div v-if="!mobile && collection && collection.canEdit">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        @click.stop="dialog = 'edit-collection'"
                        icon
                        class="pl-5"
                      >
                        <v-icon class="blue--text">mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>Edit Collection</span>
                  </v-tooltip>
                </div>
              </v-row>
              <v-row v-if="mobile" class="justify-center">
                <div v-if="collection && collection.canEdit">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        @click.stop="dialog = 'edit-collection'"
                        icon
                      >
                        <v-icon class="blue--text">mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>Edit Collection</span>
                  </v-tooltip>
                </div>
              </v-row>
              <div v-if="!mobile">
                <!-- DESKTOP: Description -->
                <p
                  v-if="collection.description"
                  class="black--text mb-0 py-2 caption"
                >
                  {{ collection.description }}
                </p>
                <!-- DESKTOP: # of stories -->
                <v-subheader
                  v-if="collection.stories.length > 0"
                  light
                  class="pa-0"
                >
                  {{ collection.stories.length }}
                  {{ collection.stories.length == 1 ? " Story " : " Stories " }}
                  in this Collection
                </v-subheader>
              </div>
            </v-col>
            <v-col v-if="mobile" order="3">
              <!-- MOBILE: Description -->
              <p
                v-if="collection.description"
                class="black--text mb-0 py-2 caption"
              >
                {{ collection.description }}
              </p>
              <!-- MOBILE: # of stories -->
              <v-subheader
                v-if="collection.stories.length > 0"
                light
                class="pa-0"
              >
                {{ collection.stories.length }}
                {{ collection.stories.length == 1 ? " Story " : " Stories " }}
                in this Collection
              </v-subheader>
            </v-col>
          </v-row>
          <v-divider class="black my-8"></v-divider>
        </v-col>
      </v-row>

      <!-- STORIES -->
      <v-row>
        <v-col cols="12">
          <Stories
            title="Stories"
            :stories="stories"
            @save="$emit('processStory', $event)"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Dialog -->
    <NewCollectionDialog
      v-if="collection && dialog === 'edit-collection'"
      :show="dialog === 'edit-collection'"
      :collection="collection"
      :title="`Edit ${collection.name || 'Untitled'} Collection`"
      editing
      @submit="processCollection"
      @delete="dialog = 'delete-collection'"
      @close="dialog = null"
    />
    <DeleteCollectionDialog
      v-if="dialog === 'delete-collection'"
      :show="dialog === 'delete-collection'"
      @submit="deleteCollection"
      @close="dialog = null"
    />
  </div>
</template>

<script>
import { deleteCollection } from "@/lib/collection-helpers";
import { getCollection } from "@/lib/story-helpers";
import { getTribalProfile } from "@/lib/community-helpers";

import mapProfileMixins from "@/mixins/profile-mixins.js";
import { saveCollectionsMixin } from "@/mixins/collection-mixins.js";

import WhakapapaShowViewCard from "../components/whakapapa/WhakapapaShowViewCard";
import { mapGetters, mapMutations } from "vuex";
import Stories from "../components/archive/Stories.vue";

import NewCollectionDialog from "@/components/dialog/archive/NewCollectionDialog.vue";
import DeleteCollectionDialog from "@/components/dialog/archive/DeleteCollectionDialog.vue";

export default {
  name: "CollectionShow",
  // TODO: move to mixin
  mixins: [
    saveCollectionsMixin,
    mapProfileMixins({
      mapMethods: ["getTribe"]
    })
  ],
  apollo: {
    collection() {
      return {
        ...getCollection(this.$route.params.collectionId)
      };
    }
  },
  components: {
    WhakapapaShowViewCard,
    Stories,
    NewCollectionDialog,
    DeleteCollectionDialog
  },
  data() {
    return {
      collection: null,
      access: null,
      dialog: null
    };
  },
  computed: {
    ...mapGetters(["whoami", "currentAccess", "showStory"]),
    stories() {
      if (!this.collection || !this.collection.stories) return [];

      return this.collection.stories.map(link => {
        return {
          linkId: link.linkId,
          ...link.story
        };
      });
    },
    mobile() {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm;
    },
    image() {
      // if there is an image return it
      if (
        this.collection &&
        this.collection.image &&
        this.collection.image.uri
      ) {
        return this.collection.image.uri;
      }

      // otherwise return a default one
      return this.type === "view" ? whakapapa : niho;
    }
  },
  watch: {
    async collection(collection) {
      if (collection.recps && collection.recps.length > 0) {
        const tribe = await this.getTribe(collection.recps[0]);
        this.access = getTribalProfile(tribe, this.whoami);
        this.setCurrentAccess(this.access);
      }
    }
  },
  methods: {
    ...mapMutations(["setCurrentAccess"]),

    async processCollection($event) {
      const { stories } = $event;

      await this.saveCollection($event);
      await this.saveStoriesToCollection(this.collection, stories);

      this.$parent.$apollo.queries.collections.refetch({
        filter: { groupId: this.$route.params.tribeId }
      });
      this.$parent.$apollo.queries.stories.refetch({
        filter: { groupId: this.$route.params.tribeId }
      });

      this.$apollo.queries.collection.refetch();
    },
    async deleteCollection() {
      const res = await this.$apollo.mutate(
        deleteCollection(this.collection.id, new Date())
      );

      if (res.errors) {
        console.error("failed to delete collection", res.errors);
        return;
      }

      // reload parent component collections
      await this.$parent.$apollo.queries.collections.refetch({
        filter: { groupId: this.$route.params.tribeId }
      });

      // go to the default archive page
      const [newPath] = this.$route.fullPath.split("archive/");
      this.$router.push({ path: newPath + "archive" }).catch(() => {});
    }
  }
};
</script>
<style lang="scss">
@media (min-width: 1264px) and (max-width: 1903px) {
  .col-lg-20p {
    width: 20%;
    max-width: 20%;
    flex-basis: 20%;
  }
  .col-lg-60p {
    width: 60%;
    max-width: 60%;
    flex-basis: 60%;
  }
  .col-lg-80p {
    width: 80%;
    max-width: 80%;
    flex-basis: 80%;
  }
}

.body-width {
  max-width: 100vw;
}

.niho-bg {
  background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.99),
      rgba(255, 255, 255, 0.7)
    ),
    url(../assets/niho.svg);
  background-position-x: 100px;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

/* .fade-enter-active,
.fade-leave-active {
  transition-duration: 0.2;
  transition-property: top;
  transition-timing-function: ease-in-out;
 } */

.fade-enter-active {
  transition: all 0.6s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}</style
>22px;
