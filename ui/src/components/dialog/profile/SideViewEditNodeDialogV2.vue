<template>
  <div class="side-menu" style="border-left: 0.5px solid rgba(0,0,0,0.1);">
    <!-- Mobile version of side menu is a Dialog -->
    <Dialog v-if="mobile" :title="formData.preferredName" :show="show" @close="close" width="720px" :goBack="close" :enableBar="false" :isEditing="isEditing">
      <!-- Slot Top -->
      <template v-slot:top>
        <!-- Avatar -->
        <Avatar
          class="big-avatar"
          size="250px"
          :image="formData.avatarImage"
          :alt="profile.preferredName"
          :gender="formData.gender"
          :bornAt="formData.bornAt"
          :diedAt="formData.diedAt"
          :isEditing="isEditing"
          style="margin-top: 20px;"
          @updateAvatar="formData.avatarImage = $event"
        />
      </template>

      <!-- Slot Title -->
      <template v-slot:title >
        <v-row class="justify-center" style="margin-top: -20px;">
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
      </template>

      

      <!-- Slot Content -->
      <template v-slot:content>

        <div v-if="!isEditing">
        
          <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px;" class="flex-column ma-0" >
              <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
                <v-col cols="6">
                  <!-- Legal Name -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info">{{formData.legalName}}</p>
                  </v-row>
                </v-col>

                <v-col cols="6">
                  <!-- Born At -->
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
                  <!-- Profession -->
                  <v-row>
                    <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                  </v-row>
                  <v-row class="py-0 justify-center">
                    <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.profession}}</p>
                  </v-row>
                </v-col>

                <v-col cols="6">
                  <!-- Location -->
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
            
            <!-- Information Col -->
            <v-col cols="12" class="border-right">
              
              <!--===== Family Members =====-->
              <v-row v-if="!isEditing" justify-sm="space-around">

                <!-- Parents -->
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

                <v-divider v-if="profile.siblings" inset />

                <!-- Siblings -->
                <v-col :cols="12" v-if="profile.siblings" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.siblings"
                    group-title="Siblings"
                    size="60px"
                    :show-labels="true"
                    @profile-click="openProfile($event)"
                  />
                </v-col>

                <v-divider inset />

                <!-- Children -->
                <v-col :cols="12" class="pa-0">
                  <AvatarGroup
                    :profiles="profile.children"
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
          
          
          <v-row justify="center" align="center" class="mt-5">
            <v-icon>
                mdi-lock
            </v-icon>
            <small> Private record - Only visible by you</small>
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

                        <!-- Perferred Name -->
                        <v-text-field
                          v-model="formData.preferredName"
                          label="Preferred name"
                          v-bind="customProps"
                          outlined
                        />
                        <!-- </slot> -->
                      </v-col>
                      
                      <!-- Legal Name -->
                      <v-col cols="12" class="pa-1">
                        <v-text-field
                          v-model="formData.legalName"
                          label="Legal name."
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
          
                      <!-- Alternative Names -->
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
                            color="#BA041B"
                          />
                        </v-col>
                      </template>
          
                      <!-- Add Names -->
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
                            color="#BA041B"
                          />
                        </v-col>
                        <v-col class="pa-1">
                          <AddButton :align="'flex-end'" label="Add name" @click="addAltNameField" row />
                        </v-col>
                      </template>
                    </v-row>
          
                      <!-- DATE OF BIRTH -->
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
                    <!-- ORDER OF BIRTH -->
                    <v-row>
                      <v-col v-if="!readonly || formData.birthOrder" cols="12" class="pa-1">
                        <v-text-field
                          v-model="formData.birthOrder"
                          type="number"
                          label="Order of birth"
                          min="1"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
          
                  </v-col>
                </v-row>
          
                <v-row class="pa-2">  
                  <!-- GENDER VIEW -->
                  <v-col  v-if="readonly" cols="12" class="pa-1">
                    <v-text-field
                      v-model="formData.gender"
                      label="Gender"
                      v-bind="customProps"
                    />
                  </v-col>
                  <!-- GENDER EDIT -->
                  <v-col v-else class="pa-1"  cols="12">
                    <p class="text-field">Gender</p>
                    <!-- <v-radio-group v-model="formData.gender" row class="mt-0 pt-0" hide-details>
                      <v-radio v-for="(gender, index) in genders"
                        :value="gender" :key="index" :label="gender"
                        class="ma-0 pa-0  pr-2 radio-button"
                        :id="gender"
                      />
                    </v-radio-group> -->
                    <v-row class="gender-button-row">
                      <GenderButton v-for="(gender, index) in genders" 
                        :key="index" 
                        :gender="gender" 
                        @updateSelectedGender="updateGender"
                        class="pa-0" 
                      />
                    </v-row>
                  </v-col>
          
                  <!-- DESCRIPTION -->
                  <!-- Description textarea -->
                  <!-- <v-col class="ml-4" v-if="form.showDescription || readonly"> -->
                  <v-col class="pa-1"  cols="12">
                    <v-textarea
                      v-model="formData.description"
                      label="Description"
                      v-bind="customProps"
                      no-resize 
                      rows="4" 
                      auto-grow
                      outlined
                      color="#BA041B"
                    >
                    </v-textarea>
                  </v-col>
                  <!-- Description button -->
                  <!-- <v-col v-else cols="12" sm="6" class="pa-1 ml-4">
                    <AddButton label="Add description" @click="form.showDescription = true" row />
                  </v-col> -->
                </v-row>
          
          
                
                <v-row class="pa-2"> 
                  <v-col cols="12">
                    <!-- Contact -->
                    <v-row>
                      <v-col cols="12" class="pa-1">
                          <v-text-field
                            v-model="formData.contact"
                            label="Email"
                            v-bind="customProps"
                            outlined
                            color="#BA041B"
                          />
                        </v-col>
                    </v-row>
                    <!-- Profession -->
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
                
                  <v-col cols="12" >
                    <v-row>
                      <v-col cols="12" class="pa-1">
                        <!-- Location -->
                        <v-text-field
                          v-model="formData.location"
                          label="Location"
                          v-bind="customProps"
                          outlined
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                  <!-- Action buttons -->
                  <v-row>
                      <!-- Delete button -->
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

    <!-- DESKTOP -->
    <v-form v-else ref="form" style="height:100%;">
      <v-card
        @close="close"
        :node="profile"
        light
        flat
        class="pa-3"
      >
        <!-- Mobile version of side menu -->
        <!-- <Appbar v-if="mobile" enableMenu app :goBack="close" :sideMenu="sideMenu"  /> -->

        <!-- <DialogTitleBanner :title="formData.preferredName" :mobile="mobile" @close="close"  style=""/> -->

        <v-row class="ma-0 pa-0 flex-column">
          <!-- Dialog close button -->
          <v-row class="justify-end pr-2">
            
              <v-icon @click="close" color="secondary">mdi-close</v-icon>
            
          </v-row>
          <!-- Avatar -->
          <v-row class="justify-center">
            <Avatar
              class="big-avatar"
              size="250px"
              :image="formData.avatarImage"
              :alt="profile.preferredName"
              :gender="formData.gender"
              :bornAt="formData.bornAt"
              :diedAt="formData.diedAt"
              :isEditing="isEditing"
              @updateAvatar="formData.avatarImage = $event"
            />
          </v-row>
        </v-row>
        <!-- END of Avatar -->
    
        <!-- Desktop Title -->
      
        <v-row class="d-flex justify-center flex-column" style="margin-top: -20px;">
          <h1 v-if="!isEditing" style="text-align: center;">{{ formData.preferredName }}</h1>
          <!-- Editing Name -->
          <h1 v-else style="text-align: center;">Edit {{ formData.preferredName }}</h1>
          <v-row v-if="!isEditing" class="justify-center">
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
    
    
          <!-- Desktop Content -->
        <v-row>

          <v-col v-if="!isEditing">
            <v-row style="border: 0.5px solid rgba(0,0,0,0.12); border-radius: 10px;" class="flex-column ma-0" >
                <v-row style="border-bottom: 0.5px solid rgba(0,0,0,0.12);" class="ma-0">
                  <v-col cols="6">
                    <!-- Legal Name -->
                    <v-row>
                      <v-col class="py-1 px-0 profile-label"><small>Legal Name</small></v-col>
                    </v-row>
                    <v-row class="py-0 justify-center">
                      <p class="ma-0 profile-info">{{formData.legalName}}</p>
                    </v-row>
                  </v-col>
    
                  <v-col cols="6">
                    <!-- Born At -->
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
                    <!-- Profession -->
                    <v-row>
                      <v-col class="py-1 px-0 profile-label"><small>Occupation</small></v-col>
                    </v-row>
                    <v-row class="py-0 justify-center">
                      <p class="ma-0 profile-info" style="font-size: 0.8em">{{formData.profession}}</p>
                    </v-row>
                  </v-col>
    
                  <v-col cols="6">
                    <!-- Location -->
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
              
              <!-- Information Col -->
              <v-col cols="12" class="border-right">
                
                <!--===== Family Members =====-->
                <v-row v-if="!isEditing" justify-sm="space-around">
    
                  <!-- Parents -->
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
    
                  <v-divider v-if="profile.siblings" inset />
    
                  <!-- Siblings -->
                  <v-col :cols="12" v-if="profile.siblings" class="pa-0">
                    <AvatarGroup
                      :profiles="profile.siblings"
                      group-title="Siblings"
                      size="60px"
                      :show-labels="true"
                      @profile-click="openProfile($event)"
                    />
                  </v-col>
    
                  <v-divider inset />
    
                  <!-- Children -->
                  <v-col :cols="12" class="pa-0">
                    <AvatarGroup
                      :profiles="profile.children"
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
            
            <v-row justify="center" align="center" class="mt-5">
              <v-icon>
                  mdi-lock
              </v-icon>
              <small> Private record - Only visible by you</small>
            </v-row>
          
          </v-col>

          <!-- Desktop Editing -->
          <v-col v-else>
              <v-row>
                  <v-row class="pa-2">
                    <!-- Names -->
                    <v-col class="pt-4">
                      <v-row>
                        <v-col cols="12" class="pa-1">
                          <!-- <slot name="search"> -->

                          <!-- Perferred Name -->
                          <v-text-field
                            v-model="formData.preferredName"
                            label="Preferred name"
                            v-bind="customProps"
                            outlined
                            color="#BA041B"
                          />
                          <!-- </slot> -->
                        </v-col>
                        
                        <!-- Legal Name -->
                        <v-col cols="12" class="pa-1">
                          <v-text-field
                            v-model="formData.legalName"
                            label="Legal name."
                            v-bind="customProps"
                            outlined
                            color="#BA041B"
                          />
                        </v-col>
            
                        <!-- Alternative Names -->
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
                              color="#BA041B"
                            />
                          </v-col>
                        </template>
            
                        <!-- Add Names -->
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
                              color="#BA041B"
                            />
                          </v-col>
                          <v-col class="pa-1">
                            <AddButton :align="'flex-end'" label="Add name" @click="addAltNameField" row />
                          </v-col>
                        </template>
                      </v-row>
            
                        <!-- DATE OF BIRTH -->
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
                      <!-- ORDER OF BIRTH -->
                      <v-row>
                        <v-col v-if="!readonly || formData.birthOrder" cols="12" class="pa-1">
                          <v-text-field
                            v-model="formData.birthOrder"
                            type="number"
                            label="Order of birth"
                            min="1"
                            v-bind="customProps"
                            outlined
                            color="#BA041B"
                          />
                        </v-col>
                      </v-row>
            
                    </v-col>
                  </v-row>
            
                  <v-row class="pa-2">  
                    <!-- GENDER VIEW -->
                    <v-col  v-if="readonly" cols="12" class="pa-1">
                      <v-text-field
                        v-model="formData.gender"
                        label="Gender"
                        v-bind="customProps"
                      />
                    </v-col>
                    <!-- GENDER EDIT -->
                    <v-col v-else class="pa-1"  cols="12">
                      <p class="text-field">Gender</p>
                      <!-- <v-radio-group v-model="formData.gender" row class="mt-0 pt-0" hide-details>
                        <v-radio v-for="(gender, index) in genders"
                          :value="gender" :key="index" :label="gender"
                          class="ma-0 pa-0  pr-2 radio-button"
                          :id="gender"
                        />
                      </v-radio-group> -->
                      <v-row class="gender-button-row">
                        <GenderButton v-for="(gender, index) in genders" 
                          :key="index" 
                          :gender="gender" 
                          @updateSelectedGender="updateGender"
                          class="pa-0" 
                        />
                      </v-row>
                    </v-col>
            
                    <!-- DESCRIPTION -->
                    <!-- Description textarea -->
                    <!-- <v-col class="ml-4" v-if="form.showDescription || readonly"> -->
                    <v-col class="pa-1"  cols="12">
                      <v-textarea
                        v-model="formData.description"
                        label="Description"
                        v-bind="customProps"
                        no-resize 
                        rows="4" 
                        auto-grow
                        outlined
                        color="#BA041B"
                      >
                      </v-textarea>
                    </v-col>
                    <!-- Description button -->
                    <!-- <v-col v-else cols="12" sm="6" class="pa-1 ml-4">
                      <AddButton label="Add description" @click="form.showDescription = true" row />
                    </v-col> -->
                  </v-row>
            
            
                  
                  <v-row class="pa-2"> 
                    <v-col cols="12">
                      <!-- Contact -->
                      <v-row>
                        <v-col cols="12" class="pa-1">
                            <v-text-field
                              v-model="formData.contact"
                              label="Email"
                              v-bind="customProps"
                              outlined
                              color="#BA041B"
                            />
                          </v-col>
                      </v-row>
                      <!-- Profession -->
                      <v-row>
                        <v-col cols="12" class="pa-1">
                          <v-text-field
                            v-model="formData.profession"
                            label="Occupation"
                            v-bind="customProps"
                            outlined
                            color="#BA041B"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  
                    <v-col cols="12" >
                      <v-row>
                        <v-col cols="12" class="pa-1">
                          <!-- Location -->
                          <v-text-field
                            v-model="formData.location"
                            label="Location"
                            v-bind="customProps"
                            outlined
                            color="#BA041B"
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>

                    <!-- Action buttons -->
                    <v-row>
                        <!-- Delete button -->
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
  import ImagePicker from '@/components/ImagePicker.vue'
  import Appbar from '@/components/Appbar.vue'
  import GenderButton from '@/components/button/GenderButton.vue'

  import Dialog from '@/components/dialog/Dialog.vue'
  import DialogTitleBanner from '@/components/dialog/DialogTitleBanner.vue'
  
  import isEqual from 'lodash.isequal'
  import isEmpty from 'lodash.isempty'
  import pick from 'lodash.pick'
  import clone from 'lodash.clonedeep'
  
  function defaultData (profile) {
    return {
      id: profile.id,
      gender: profile.gender,
      legalName: profile.legalName ? profile.legalName : 'Unknown' ,
      bornAt: profile.bornAt ? profile.bornAt : 'Unknown' ,
      diedAt: profile.diedAt,
      preferredName: profile.preferredName,
      avatarImage: profile.avatarImage,
      description: profile.description,
      birthOrder: profile.birthOrder,
      relationshipType: profile.relationship ? profile.relationship.relationshipType ? profile.relationship.relationshipType : null : null,
      location: profile.location ? profile.location : 'Unknown' ,
      contact: profile.contact ? profile.contact : 'Unknown' ,
      profession: profile.profession ? profile.profession : 'Unknown' ,
      altNames: {
        currentState: clone(profile.altNames),
        add: [], // new altNames to add
        remove: [] // altNames to remove
      },
      isDeceased: !!profile.diedAt // set to true if this value is set
    }
  }
  
  export default {
    name: 'SideViewEditNodeDialogV2',
    components: {
      Avatar,
      AvatarGroup,
      NodeDatePicker,
      AddButton,
      ImagePicker,
      Appbar,
      Dialog,
      DialogTitleBanner,
      GenderButton
    },
    props: {
      goBack: { type: Function },
      profile: { type: Object, required: true },
      deleteable: { type: Boolean, default: false },
      warnAboutChildren: { type: Boolean, default: true },
      sideMenu: { type: Boolean, default: false },
      relationshipLinks: { type: Array },
      show: {type: Boolean,required: true},
      readonly: { type: Boolean, default: false },
    },
  
    data () {
      return {
        testmapimage: require('../../../assets/map-test.png'),
        genders: GENDERS,
        // titles: TITLES,
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
      }
    },
    computed: {
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
                if (value && value !== this.profile.relationship.relationshipType) {
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
      'formData.isDeceased' (newValue) {
        if (!newValue) this.formData.diedAt = ''
      }
    },
    methods: {
      removeAltNameField (index) {
        this.formData.altNames.add.splice(index, 1)
      },
      updateGender(gender) {
        console.log("got gender: ", gender)
        this.formData.gender = gender;
      },
      addAltNameField () {
        this.formData.altNames.add.push(null)
      },
      updateAvatar (avatarImage) {
        this.formData.avatarImage = avatarImage
        // this.toggleAvatar(null)
      },
      age(born) {
        var age = calculateAge(born)
        if (isNaN(age)) {
          return 'Unknown'
        } else {
          return age
        }
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
      openProfile (profileId) {
        this.$emit('open-profile', profileId)
      },
      toggleNew (type) {
        this.$emit('new', type)
      },
      toggleEdit () {
        console.log("editing mode is: ", this.isEditing)
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
    },
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

  </style>
  