function addHome(){
  // navbar resize = add link to home
  // called using jQuery
  let device = window.innerWidth;
  // console.log(device);
  if (device <= 768){
      if (document.querySelector(".homelink")){
          // console.log("homelink already exists")
      } else{
          let homelink = document.createElement("li");
          let navbarlist = document.querySelector(".navbar-nav")
          homelink.className += ("nav-item text-right homelink");
          homelink.innerHTML = '<a class="navlink text-primary" href="/index.html" title="Home">Home</a>'
          document.querySelector(".navbar-nav").insertBefore(homelink, navbarlist.firstChild)
      }

  } else {
      if (document.querySelector(".homelink")){
          document.querySelector(".homelink").remove()
      }
  
  }
}
addHome()

$(window).resize(function(){
  // console.log("window was resized")
  addHome()
})

