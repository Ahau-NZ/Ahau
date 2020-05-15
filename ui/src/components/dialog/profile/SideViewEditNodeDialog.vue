<template>
  <div class="side-menu" style="border-left: 0.5px solid rgba(0,0,0,0.1);">

    <!--===== MOBILE VERSION of side menu is a Dialog =====-->
    <Dialog v-if="mobile" :title="formData.preferredName" :show="show" @close="close" width="720px" :goBack="close" :enableBar="false" :isEditing="isEditing">
      <!-- Slot Top -->
      <template v-slot:top>
        <!-- Mobile: Avatar -->
        <Avatar
          class="big-avatar"
          size="250px"
          :image="formData.avatarImage"
          :alt="profile.preferredName"
          :gender="formData.gender"
          :bornAt="formData.bornAt"
          :deceased="formData.deceased"
          :isEditing="isEditing"
          style="margin-top: 20px;"
          @updateAvatar="formData.avatarImage = $event"
        />
      </template>

      <!-- Mobile: Slot Title -->
      <template v-slot:title >
        <v-row class="justify-center" style="margin-top: -20px;">
          <v-btn
            :to="{ name: 'profileShow', params: { id: profile.id } }"
            color="white"
            text
            medium
            class="blue--text"
          >
            <v-icon small class="blue--text" left>mdi-pencil</v-icon>Profile
          </v-btn>
          <v-btn
            @click="toggleEdit"
            color="white"
            text
            medium
            class="blue--text"
          >
            <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
          </v-btn>
        </v-row>

        <!-- Mobile: Person description -->
        <v-row v-if="formData.description" class="mb-2">
            <v-col cols="12">
                <!-- Location -->
                <v-row>
                  <v-col class="py-1 px-0 profile-label"><small>Description</small></v-col>
                </v-row>
                <v-row class="py-0 justify-center">
                  <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.description}}</p>
                </v-row>
              </v-col>
        </v-row>

      </template>

      <!-- Mobile: Slot Content -->
      <template v-slot:content>

        <div v-if="!isEditing">

          <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px;" class="flex-column ma-0" >
              <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
                <v-col cols="6">
                  <!-- Mobile: Legal Name -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{formData.legalName}}</p>
                  </v-row>
                </v-col>

                <v-col cols="6">
                  <!-- Mobile: Born At -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Age</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{age(formData.bornAt)}}</p>
                  </v-row>
                </v-col>
              </v-row>

              <v-row class="ma-0">
                <v-col cols="6">
                  <!-- Mobile: Profession -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.profession}}</p>
                  </v-row>
                </v-col>

                <v-col cols="6">
                  <!-- Mobile: Location -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Location</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.location}}</p>
                  </v-row>
                </v-col>
              </v-row>
          </v-row>

          <v-row class="px-2">

            <!-- Mobile: Information Col -->
            <v-col cols="12" class="border-right">

              <!--===== Family Members =====-->
              <v-row v-if="!isEditing" class="d-flex flex-column justify-center align-center">

                <!-- Mobile: Parents -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.parents"
                    group-title="Parents"
                    size="50px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                    <AddButton @click="toggleNew('parent')" />
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.siblings" class="family-divider"/>

                <!-- Mobile: Siblings -->
                <v-col :cols="12" v-if="profile.siblings" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.siblings"
                    group-title="Siblings"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  >
                   <AddButton v-if="view.focus !== profile.id" @click="toggleNew('sibling')" />
                  </AvatarGroup>
                </v-col>

                <hr v-if="profile.siblings" class="family-divider"/>

                <!-- Mobile: Children -->
                <v-col :cols="12" class="pa-0">
                     <AvatarGroup
                      v-if="profile.children.length"
                      :profiles="profile.children"
                      group-title="Children"
                      size="60px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    >
                      <AddButton @click="toggleNew('child')" />
                    </AvatarGroup>
                    <AvatarGroup
                      v-else
                      :profiles="profile._children"
                      group-title="Children"
                      size="60px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    >
                    <AddButton @click="toggleNew('child')" />
                  </AvatarGroup>
                </v-col>
              </v-row>
              <!-- END Family Members -->

              </v-col>
          </v-row>

        </div>

        <!-- Start of Mobile editing -->
        <v-form v-else ref="form">
            <v-row>
                <v-row class="pa-2">
                  <!-- Names -->
                  <v-col class="pt-4">
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <!-- <slot name="search"> -->

                        <!-- Mobile: Editing: Perferred Name -->
                        <v-text-field
                          v-model="formData.preferredName"
                          label="First name / Preferred name"
                          v-bind="customProps"
                          outlined
                        />
                        <!-- </slot> -->
                      </v-col>

                      <!-- Mobile: Editing: Legal Name -->
                      <v-col cols="12" class="pa-1">
                        <v-text-field
                          v-model="formData.legalName"
                          label="Legal name."
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>

                      <!-- Mobile: Editing: Alternative Names -->
                      <template>
                        <v-col v-for="(altName, index) in formData.altNames.value"
                          :key="`value-alt-name-${index}`"
                          cols="12"
                          class="pa-1"
                        >
                          <v-text-field
                            v-model="formData.altNames.value[index]"
                            :label="`Alternative name ${index + 1}`"
                            :append-icon="readonly ? '' : 'mdi-delete'"
                            @click:append="removeAltName(formData.altNames.value[index], index)"
                            readonly
                            v-bind="customProps"
                            outlined
                          />
                        </v-col>
                      </template>

                      <!-- Mobile: Editing: Add Names -->
                      <template v-if="!readonly">
                        <v-col v-for="(altName, index) in formData.altNames.add"
                          :key="`add-alt-name-${index}`"
                          cols="12"
                          class="pa-1"
                        >
                          <v-text-field
                            v-model="formData.altNames.add[index]"
                            :label="`Alternative name ${index + 1}`"
                            append-icon="mdi-delete"
                            @click:append="removeAltNameField(index)"
                            v-bind="customProps"
                            cols="12"
                            outlined
                          />
                        </v-col>
                        <v-row class="mx-1">
                          <v-col cols="8"></v-col>
                          <AddButton :align="'flex-end'" :width="'50px'" label="Add name" @click="addAltNameField" row/>
                        </v-row>
                      </template>
                    </v-row>
                    <!-- Mobile: Editing: DATE OF BIRTH -->
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <NodeDatePicker
                          :value="formData.bornAt"
                          label="Date of birth"
                          @date="formData.bornAt = $event"
                          :readonly="readonly"
                        />
                      </v-col>
                    </v-row>
                    <!-- Mobile: Editing: relationship type-->
                    <v-row>
                      <v-col v-if="!readonly || formData.relationshipType" cols="12" class="pa-1">
                        <v-select
                          v-model="formData.relationshipType"
                          label="Related by"
                          :items="relationshipTypes"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                    <!-- Mobile: Editing: ORDER OF BIRTH -->
                    <v-row>
                      <v-col v-if="!readonly || formData.birthOrder" cols="12" class="pa-1">
                        <v-select
                          v-model="formData.birthOrder"
                          type="number"
                          label="Order of birth"
                          :items="orderNumbers"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                    <!-- Mobile: Editing: DECEASED PICKER-->
                     <v-row>
                      <v-col  v-if="!readonly || formData.deceased" cols="12" class="pa-1">
                          <v-checkbox v-model="formData.deceased"
                            label="No longer living" :hide-details="true"
                            v-bind="customProps"
                            outlined
                          />
                        </v-col>
                        <!-- Desktop: Editing: DIED AT PICKER -->
                        <v-col cols="12" class="pa-1">
                          <NodeDatePicker
                            v-if="formData.deceased"
                            label="Date of death"
                            :value="formData.diedAt"
                            @date="formData.diedAt = $event"
                            :readonly="readonly"
                          />
                        </v-col>
                      </v-row>

                  </v-col>
                </v-row>

                <v-row class="pa-2">
                  <v-col cols="12">
                    <v-row>
                      <!-- Mobile: Editing: GENDER VIEW -->
                      <v-col  v-if="readonly" class="pa-1">
                        <v-text-field
                          v-model="formData.gender"
                          label="Gender"
                          v-bind="customProps"
                        />
                      </v-col>
                      <!-- Mobile: Editing: GENDER EDIT -->
                      <v-col v-else class="pa-1">
                        <p class="text-field">Gender</p>

                        <v-row class="gender-button-row">
                          <!-- Mobile: Editing: TANE -->
                          <v-col>
                            <div class="gender-button" @click="updateSelectedGender('male')">
                              <img ref="taneImg" :src="require('@/assets/tane-outlined.svg')" class="gender-image">
                            </div>
                          </v-col>
                          <!-- Mobile: Editing: WAHINE -->
                          <v-col>
                            <div class="gender-button" @click="updateSelectedGender('female')">
                              <img ref="wahineImg" :src="require('@/assets/wahine-outlined.svg')" class="gender-image">
                            </div>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12">
                    <v-row>
                      <!-- Mobile: Editing: Description textarea -->
                      <v-col cols="12" class="pa-1">
                        <v-textarea
                          v-model="formData.description"
                          label="Description"
                          v-bind="customProps"
                          no-resize
                          rows="4"
                          auto-grow
                          outlined
                        >
                        </v-textarea>
                      </v-col>
                    </v-row>
                    <!-- Mobile: Editing: Occupation -->
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <v-text-field
                          v-model="formData.profession"
                          label="Occupation"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row class="pa-2">
                  <v-col cols="12">
                    <!-- Mobile: Editing: Email -->
                    <v-row>
                      <v-col cols="12" class="pa-1">
                          <v-text-field
                            v-model="formData.email"
                            label="Email"
                            v-bind="customProps"
                            outlined
                          />
                        </v-col>
                    </v-row>
                    <!-- Mobile: Editing: Phone -->
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <v-text-field
                          v-model="formData.phone"
                          label="Phone"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col cols="12">
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <!-- Mobile: Editing: Address -->
                        <v-text-field
                          v-model="formData.address"
                          label="Address"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <!-- Mobile: Editing: City, Country -->
                        <v-text-field
                          v-model="formData.location"
                          label="City, Country"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                  <!-- Mobile: Editing: Action buttons -->
                  <v-row>
                      <!-- Mobile: Editing: Delete button -->
                      <v-col cols="12" sm="auto" class="mb-8">
                        <v-btn
                          v-if="isEditing && deleteable"
                          @click="$emit('delete')"
                          align="center"
                          color="white"
                          text
                          class="secondary--text"
                        >
                          <v-icon class="secondary--text" left>mdi-delete</v-icon>Delete this person
                        </v-btn>
                      </v-col>
                      <v-col
                        v-if="isEditing"
                        :align="mobile ? '' : 'right'"
                        :class="{
                          'pt-0': true,
                          'd-flex': mobile,
                          'justify-space-between': mobile
                        }"
                      >
                        <v-btn @click="cancel" text large fab class="secondary--text mr-10">
                          <v-icon color="secondary">mdi-close</v-icon>
                        </v-btn>
                        <v-btn @click="submit" text large fab class="blue--text ml-5" color="blue">
                          <v-icon>mdi-check</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <!-- END Action buttons -->
                </v-row>
              </v-form>

      </template>
      <!-- End of mobile content -->

    </Dialog>

    <!--===== DESKTOP VERSION of side menu =====-->
    <v-form v-else ref="form" style="height:100%; margin-top: 64px;">
      <v-card
        @close="close"
        :node="profile"
        light
        flat
        class="pa-3"
      >

      <!-- Banner here if we wanna use it on the side menu -->
      <!-- <DialogTitleBanner :title="formData.preferredName" :mobile="mobile" @close="close"  style=""/> -->

        <v-row class="ma-0 pa-0 flex-column">
          <!-- Desktop: Dialog close button -->
          <v-row class="justify-end pr-2">
              <v-icon @click="close" color="secondary">mdi-close</v-icon>
          </v-row>
          <!-- Desktop: Avatar -->
          <v-row class="justify-center">
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.avatarImage"
              :alt="profile.preferredName"
              :gender="formData.gender"
              :bornAt="formData.bornAt"
              :deceased="formData.deceased"
              :isEditing="isEditing"
              @updateAvatar="formData.avatarImage = $event"
            />
          </v-row>
        </v-row>
        <!-- END of Desktop: Avatar -->

        <!-- Desktop Title -->
        <v-row class="d-flex justify-center flex-column" style="margin-top: -20px;">
          <h1 v-if="!isEditing" style="text-align: center;">{{ formData.preferredName }}</h1>
          <!-- Editing Name -->
          <h1 v-else style="text-align: center;">Edit {{ formData.preferredName }}</h1>
          <v-row v-if="!isEditing" class="justify-center">
            <v-btn
            :to="{ name: 'profileShow', params: { id: profile.id } }"
            text
            medium
            class="blue--text"
          >
            <v-icon small class="blue--text" left>mdi-account-circle</v-icon>Profile
          </v-btn>
            <v-btn @click="toggleEdit" text medium class="blue--text">
              <v-icon small class="blue--text" left>mdi-pencil</v-icon>Edit
            </v-btn>
          </v-row>
          <!-- Editing buttons -->
          <v-row v-else class="justify-center">
            <v-btn @click="toggleEdit" text medium class="blue--text">
              <v-icon small class="blue--text" left>mdi-close</v-icon>Cancel
            </v-btn>
          </v-row>
        </v-row>

        <!-- Desktop: Person description -->
        <v-row v-if="formData.description" class="px-3">
            <v-col cols="12">
                <!-- Location -->
                <v-row>
                  <v-col class="py-1 px-0 profile-label"><small>Description</small></v-col>
                </v-row>
                <v-row class="py-0 justify-center">
                  <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.description}}</p>
                </v-row>
              </v-col>
        </v-row>

        <!-- Desktop: Content -->
        <v-row>

          <v-col v-if="!isEditing">
            <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px;" class="flex-column ma-0" >
                <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
                  <v-col cols="6">
                    <!-- Desktop: Legal Name -->
                    <v-row>
                      <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                    </v-row>
                    <v-row class="py-0 justify-center">
                      <p class="ma-0 profile-info">{{formData.legalName}}</p>
                    </v-row>
                  </v-col>

                  <v-col cols="6">
                    <!-- Desktop: Born At -->
                    <v-row>
                      <v-col class="py-1 px-0 profile-label"><small>Age</small></v-col>
                    </v-row>
                    <v-row class="py-0 justify-center">

                      <p class="ma-0 profile-info">{{age(formData.bornAt)}}</p>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row class="ma-0">
                  <v-col cols="6">
                    <!-- Desktop: Profession -->
                    <v-row>
                      <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                    </v-row>
                    <v-row class="py-0 justify-center">
                      <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.profession}}</p>
                    </v-row>
                  </v-col>

                  <v-col cols="6">
                    <!-- Desktop: Location -->
                    <v-row>
                      <v-col class="py-1 px-0 profile-label"><small>Location</small></v-col>
                    </v-row>
                    <v-row class="py-0 justify-center">
                      <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.location}}</p>
                    </v-row>
                  </v-col>
                </v-row>
            </v-row>

            <v-row class="px-2">

              <!-- Desktop: Information Col -->
              <v-col cols="12" class="border-right">

                <!--===== Family Members =====-->
                <v-row v-if="!isEditing" justify-sm="space-around">

                  <!-- Desktop: Parents -->
                  <v-col :cols="12" class="pa-0">
                    <AvatarGroup
                      :profiles="profile.parents"
                      group-title="Parents"
                      size="50px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    >
                      <AddButton @click="toggleNew('parent')"/>
                    </AvatarGroup>
                  </v-col>

                  <hr v-if="profile.siblings" class="family-divider"/>

                  <!-- Desktop: Siblings -->
                  <v-col :cols="12" v-if="profile.siblings" class="pa-0">
                    <AvatarGroup
                      :profiles="profile.siblings"
                      group-title="Siblings"
                      size="60px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    >
                      <AddButton v-if="view.focus !== profile.id" @click="toggleNew('sibling')" />
                    </AvatarGroup>
                  </v-col>

                  <hr class="family-divider">

                  <!-- Desktop: Children -->
                  <v-col :cols="12" class="pa-0">
                    <AvatarGroup
                      v-if="profile.children.length"
                      :profiles="profile.children"
                      group-title="Children"
                      size="60px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    >
                      <AddButton @click="toggleNew('child')" />
                    </AvatarGroup>
                    <AvatarGroup
                      v-else
                      :profiles="profile._children"
                      group-title="Children"
                      size="60px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    >
                      <AddButton @click="toggleNew('child')" />
                    </AvatarGroup>
                  </v-col>
                </v-row>
                <!-- END Desktop: Family Members -->

              </v-col>
            </v-row>

          </v-col>

          <!-- Desktop: Editing: START -->
          <v-col v-else>
            <v-row>
                <v-row class="pa-4">
                  <!-- Desktop: Editing: Names -->
                  <v-col class="pt-4">
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <!-- Desktop: Editing: Perferred Name -->
                        <v-text-field
                          v-model="formData.preferredName"
                          label="First name / Preferred name"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>

                      <!-- Desktop: Editing: Legal Name -->
                      <v-col cols="12" class="pa-1">
                        <v-text-field
                          v-model="formData.legalName"
                          label="Legal name."
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>

                      <!-- Desktop: Alternative Names -->
                      <template>
                        <v-col v-for="(altName, index) in formData.altNames.value"
                          :key="`value-alt-name-${index}`"
                          cols="12"
                          class="pa-1"
                        >
                          <v-text-field
                            v-model="formData.altNames.value[index]"
                            :label="`Alternative name ${index + 1}`"
                            :append-icon="readonly ? '' : 'mdi-delete'"
                            @click:append="removeAltName(formData.altNames.value[index], index)"
                            readonly
                            v-bind="customProps"
                            outlined
                          />
                        </v-col>
                      </template>

                      <!-- Desktop: Editing: Add Alt Names -->
                      <template v-if="!readonly">
                        <v-col v-for="(altName, index) in formData.altNames.add"
                          :key="`add-alt-name-${index}`"
                          cols="12"
                          class="pa-1"
                        >
                          <v-text-field
                            v-model="formData.altNames.add[index]"
                            :label="`Alternative name ${index + 1}`"
                            append-icon="mdi-delete"
                            @click:append="removeAltNameField(index)"
                            v-bind="customProps"
                            cols="12"
                            outlined
                          />
                        </v-col>
                        <v-row class="mx-1">
                          <v-col cols="8"></v-col>
                          <AddButton :align="'flex-end'" :width="'50px'" label="Add name" @click="addAltNameField" row/>
                        </v-row>
                      </template>
                    </v-row>

                      <!-- Desktop: Editing: DATE OF BIRTH -->
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <NodeDatePicker
                          :value="formData.bornAt"
                          label="Date of birth"
                          @date="formData.bornAt = $event"
                          :readonly="readonly"
                        />
                      </v-col>
                    </v-row>
                    <!-- Desktop: Editing: relationship type-->
                    <v-row>
                      <v-col v-if="!readonly || formData.relationshipType" cols="12" class="pa-1">
                        <v-select
                          v-model="formData.relationshipType"
                          label="Related by"
                          :items="relationshipTypes"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                    <!-- Desktop: Editing: ORDER OF BIRTH -->
                    <v-row>
                      <v-col v-if="!readonly || formData.birthOrder" cols="12" class="pa-1">
                        <v-select
                          v-model="formData.birthOrder"
                          type="number"
                          label="Order of birth"
                          :items="orderNumbers"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                    <!-- Desktop: Editing : DECEASED PICKER -->
                    <v-row>
                      <v-col  v-if="!readonly || formData.deceased" cols="12" class="pa-1">
                          <v-checkbox v-model="formData.deceased"
                            label="No longer living" :hide-details="true"
                            v-bind="customProps"
                            outlined
                          />
                        </v-col>
                        <!-- Desktop: Editing: DIED AT PICKER -->
                        <v-col cols="12" class="pa-1">
                          <NodeDatePicker
                            v-if="formData.deceased"
                            label="Date of death"
                            :value="formData.diedAt"
                            @date="formData.diedAt = $event"
                            :readonly="readonly"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                  <v-row class="pa-4">
                      <v-col cols="12">
                        <v-row>
                          <!-- Desktop: Editing: GENDER VIEW -->
                          <v-col  v-if="readonly" class="pa-1">
                            <v-text-field
                              v-model="formData.gender"
                              label="Gender"
                              v-bind="customProps"
                            />
                          </v-col>
                          <!-- Desktop: Editing: GENDER EDIT -->
                          <v-col v-else class="pa-1">
                            <p class="text-field">Gender</p>

                            <v-row class="gender-button-row">
                              <!-- Desktop: Editing: TANE -->
                              <v-col>
                                <div class="gender-button" @click="updateSelectedGender('male')">
                                  <img ref="taneImg" :src="require('@/assets/tane-outlined.svg')" class="gender-image">
                                </div>
                              </v-col>
                              <!-- Desktop: Editing: WAHINE -->
                              <v-col>
                                <div class="gender-button" @click="updateSelectedGender('female')">
                                  <img ref="wahineImg" :src="require('@/assets/wahine-outlined.svg')" class="gender-image">
                                </div>
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-col>

                      <v-col cols="12">
                        <v-row>
                          <!-- Desktop: Editing: Description textarea -->
                          <v-col cols="12" class="pa-1">
                            <v-textarea
                              v-model="formData.description"
                              label="Description"
                              v-bind="customProps"
                              no-resize
                              rows="4"
                              auto-grow
                              outlined
                            >
                            </v-textarea>
                          </v-col>
                        </v-row>
                        <!-- Desktop: Editing: Occupation -->
                        <v-row>
                          <v-col cols="12" class="pa-1">
                            <v-text-field
                              v-model="formData.profession"
                              label="Occupation"
                              v-bind="customProps"
                              outlined
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>

                    <v-row class="pa-4">
                      <v-col cols="12">
                        <!-- Desktop: Editing: Email -->
                        <v-row>
                          <v-col cols="12" class="pa-1">
                              <v-text-field
                                v-model="formData.email"
                                label="Email"
                                v-bind="customProps"
                                outlined
                              />
                            </v-col>
                        </v-row>
                        <!-- Desktop: Editing: Phone -->
                        <v-row>
                          <v-col cols="12" class="pa-1">
                            <v-text-field
                              v-model="formData.phone"
                              label="Phone"
                              v-bind="customProps"
                              outlined
                            />
                          </v-col>
                        </v-row>
                      </v-col>

                      <v-col cols="12">
                        <v-row>
                          <v-col cols="12" class="pa-1">
                            <!-- Desktop: Editing: Address -->
                            <v-text-field
                              v-model="formData.address"
                              label="Address"
                              v-bind="customProps"
                              outlined
                            />
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" class="pa-1">
                            <!-- Desktop: Editing: City, Country -->
                            <v-text-field
                              v-model="formData.location"
                              label="City, Country"
                              v-bind="customProps"
                              outlined
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>

                    <!-- Desktop: Editing: Action buttons -->
                    <v-row>
                      <v-col cols="12" sm="auto" class="mb-8">
                          <!-- Delete: Editing: Delete button -->
                          <v-btn
                            v-if="isEditing && deleteable"
                            @click="$emit('delete')"
                            align="center"
                            color="white"
                            text
                            class="secondary--text"
                          >
                            <v-icon class="secondary--text" left>mdi-delete</v-icon>Delete this person
                          </v-btn>
                        </v-col>
                        <v-col
                          v-if="isEditing"
                          col="12"
                          :align="mobile ? '' : 'right'"
                          class="pt-0 d-flex justify-space-between"
                        >
                          <!-- Delete: Editing: Cancel (x) button -->
                          <v-btn @click="cancel" text large fab class="secondary--text mr-10">
                            <v-icon color="secondary">mdi-close</v-icon>
                          </v-btn>
                          <!-- Delete: Editing: Save (tick) button -->
                          <v-btn @click="submit" text large fab class="blue--text ml-5" color="blue">
                            <v-icon>mdi-check</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                      <!-- END Delete: Editing: Action buttons -->
                  </v-row>
          </v-col>

        </v-row>

      </v-card>
    </v-form>

  </div>
</template>

<script>
import {
  GENDERS,
  RULES,
  RELATIONSHIPS
} from '@/lib/constants'

import calculateAge from '../../../lib/calculate-age'

import { PERMITTED_PROFILE_ATTRS, PERMITTED_RELATIONSHIP_ATTRS } from '@/lib/profile-helpers'

import Avatar from '@/components/Avatar.vue'
import AvatarGroup from '@/components/AvatarGroup.vue'
import NodeDatePicker from '@/components/NodeDatePicker.vue'
import AddButton from '@/components/button/AddButton.vue'

import Dialog from '@/components/dialog/Dialog.vue'

import isEqual from 'lodash.isequal'
import isEmpty from 'lodash.isempty'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

function defaultData (profile) {
  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    bornAt: profile.bornAt,
    diedAt: profile.diedAt,
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    relationshipType: profile.relationship ? profile.relationship.relationshipType : null,
    location: profile.location,
    email: profile.email,
    phone: profile.phone,
    deceased: profile.deceased,
    address: profile.address,
    profession: profile.profession,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    }
  }
}

export default {
  name: 'SideViewEditNodeDialog',
  components: {
    Avatar,
    AvatarGroup,
    NodeDatePicker,
    AddButton,
    Dialog
  },
  props: {
    goBack: { type: Function },
    profile: { type: Object, required: true },
    deleteable: { type: Boolean, default: false },
    warnAboutChildren: { type: Boolean, default: true },
    view: { type: Object },
    sideMenu: { type: Boolean, default: false },
    relationshipLinks: { type: Array },
    show: { type: Boolean, required: true },
    readonly: { type: Boolean, default: false }
  },

  data () {
    return {
      testmapimage: require('../../../assets/map-test.png'),
      genders: GENDERS,
      permitted: PERMITTED_PROFILE_ATTRS,
      relationshipTypes: RELATIONSHIPS,
      isEditing: false,
      formData: defaultData(this.profile),
      showDescription: false,
      deleteDialog: false,
      form: {
        valid: true,
        rules: RULES
      },
      genderSelected: ''
    }
  },
  computed: {
    orderNumbers () {
      var orderNumbers = [...Array(31).keys()]
      orderNumbers.splice(0, 1)
      return orderNumbers
    },
    mobile () {
      return this.$vuetify.breakpoint.xs
    },
    profileChanges () {
      let changes = {}
      Object.entries(this.formData).forEach(([key, value]) => {
        if (!isEqual(this.formData[key], this.profile[key])) {
          switch (key) {
            case 'altNames':
              if (!isEqual(this.formData.altNames.add, this.profile.altNames)) {
                changes[key] = pick(this.formData.altNames, ['add', 'remove'])
                changes[key].add = changes[key].add.filter(Boolean)
              }
              break
            case 'birthOrder':
              changes[key] = parseInt(value)
              break
            case 'relationshipType':
              if (value && value !== this.profile.relationshipType) {
                changes[key] = value
              }
              break
            default:
              changes[key] = value
          }
        }
      })
      return changes
    },
    hasChanges () {
      return isEqual(this.data, this.profile)
    },
    customProps () {
      return {
        readonly: !this.isEditing,
        flat: !this.isEditing,
        // appendIcon: this.isEditing ? '' ? 'mdi-delete' : 'mdi-pencil',
        hideDetails: true,
        placeholder: ' ',
        class: !this.isEditing ? 'custom' : ''
      }
    }
  },
  watch: {
    profile (newVal) {
      this.formData = defaultData(newVal)
    },
    'formData.deceased' (newValue) {
      if (!newValue) this.formData.diedAt = ''
    }
  },
  methods: {
    updateSelectedGender (genderClicked) {
      // reset images to outlined
      this.$refs.taneImg.src = require('@/assets/tane-outlined.svg')
      this.$refs.wahineImg.src = require('@/assets/wahine-outlined.svg')
      // hightlight selected image
      this.genderSelected = genderClicked
      if (this.genderSelected === 'male') {
        this.$refs.taneImg.src = require('@/assets/tane.svg')
      }
      if (this.genderSelected === 'female') {
        this.$refs.wahineImg.src = require('@/assets/wahine.svg')
      }
      // update the gender
      this.formData.gender = this.genderSelected
    },
    removeAltNameField (index) {
      this.formData.altNames.add.splice(index, 1)
    },
    addAltNameField () {
      this.formData.altNames.add.push(null)
    },
    updateAvatar (avatarImage) {
      this.formData.avatarImage = avatarImage
      // this.toggleAvatar(null)
    },
    age (born) {
      var age = calculateAge(born)
      return age
    },
    close () {
      this.$emit('close')
    },
    cancel () {
      // reset form values
      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    submit () {
      if (!this.$refs.form.validate()) {
        return
      }
      var output = Object.assign({}, pick(this.profileChanges, [...PERMITTED_PROFILE_ATTRS, ...PERMITTED_RELATIONSHIP_ATTRS]))
      if (!isEmpty(output)) {
        this.$emit('submit', output)
      }

      this.formData = defaultData(this.profile)
      this.toggleEdit()
    },
    openProfile (profile) {
      this.$emit('open-profile', profile.id)
    },
    toggleNew (type) {
      this.$emit('new', type)
    },
    toggleEdit () {
      this.isEditing = !this.isEditing
    },
    toggleAltName () {
      if (!this.formData.altNames.currentState) { this.formData.altNames.currentState = [] }
      this.formData.altNames.add.push(null)
    },
    toggleDescription () {
      this.showDescription = !this.showDescription
    },
    deleteFromState (altName, index) {
      this.deleteFromDialog(index) // removes it from the dialog
      this.formData.altNames.remove.push(altName)
    },
    deleteFromDialog (index) {
      this.formData.altNames.currentState.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Forum&display=swap');

  .custom.v-text-field > .v-input__control > .v-input__slot:before {
    border-style: none;
  }
  .custom.v-text-field > .v-input__control > .v-input__slot:after {
    border-style: none;
  }
  .close {
    top: -25px;
    right: -10px;
  }
  .big-avatar {
    position: relative;
    top: -20px;
  }
  .v-input--checkbox label {
    font-size: 14px;
  }

  .v-input--radio-group__input label {
    font-size: 14px;
  }

  ::-webkit-scrollbar {
    width: 5px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

.profile-label {
  color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
}

.profile-info {
  /* font-family: 'Forum', cursive; */
  text-align: center;
  color: black
}

.side-menu {
  background-color: white;
  height:100%;
  overflow-x: hidden;
}

.scroll {
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 100%;
}

.family-divider {
  width: 80%;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
}

.text-field {
  margin-left: 5px !important;
  margin-bottom: 0 !important;
  font-size: 0.8em;
}

.gender-button {
    width: auto;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 5px;

    .gender-image {
      width: 6em;
      height: 6em;
      border: 0.5px solid rgba(0,0,0,0.6);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border: 2px solid rgba(0,0,0,0.87);
      }
    }
}

</style>
