import './Main_css/main.css'
import profilelist from './components/Profilelist.vue'
import posts from './components/Posts.vue'
import { createApp } from 'vue'
import App from './App.vue'
import profileinfo from './components/Profileinfo.vue'
import post from './components/Post.vue'
import postview from './components/Postview.vue'
import profile from './components/Profile.vue'
import login from './components/Login.vue'
import signup from './components/Signup.vue'
import loader from "./components/Loader.vue"
import Profileimage from './components/Profileimage.vue'

var app = createApp(App)
app.component("ProfileList",profilelist)
app.component("Profileinfo",profileinfo)
app.component("Posts",posts)
app.component("Post",post)
app.component("Postview",postview)
app.component("Profile",profile)
app.component("Login",login)
app.component("Signup",signup)
app.component("Loader",loader)
app.component("ProfileImage",Profileimage)
app.mount('#app')


