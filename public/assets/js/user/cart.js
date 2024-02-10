

function addToDb(productid, vIndex) {
  // Retrieve the value of isLoggedIn from the data attribute
  var isLoggedIn = JSON.parse(document.getElementById('authStatus').getAttribute('data-is-loggedin'));

  // Check if the user is authenticated
  if (!isLoggedIn) {
      // If the user is not logged in, show a SweetAlert and redirect to the login page
      Swal.fire({
          title: 'Please Login',
          text: 'You need to log in before adding items to your cart.',
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonText: 'OK',
      }).then(() => {
          window.location.href = '/login'; // Change '/login' to the actual URL of your login page
      });
      return;
  }

  // Get the selected size value
  var selectedSize = document.querySelector('input[name="size"]:checked');
  const qunt = document.getElementById('quantity').value;

  // Check if a size is selected
  if (selectedSize) {
      console.log('Selected size:', selectedSize.value);
      const data = {
          productId: productid,
          index: vIndex,
          size: selectedSize.value,
          quantity: qunt,
      };

      $.ajax({
          type: 'POST',
          url: '/add-cart',
          data: JSON.stringify(data),
          contentType: 'application/json',
          success: (response) => {
              if (response.added) {
                  if (response.isInCart) {
                      // Redirect to the cart if the product is already in the cart
                      window.location.href = '/cart';
                  }
                  console.log('ok done');
                  Swal.fire({
                      title: 'Product Added!',
                      text: 'The product has been added to your cart.',
                      icon: 'success',
                      showConfirmButton: true,
                      confirmButtonText: 'OK',
                  }).then((result) => {
                      if (result.isConfirmed) {
                          window.location.href = '/cart';
                      }
                  });
              }
          },
      });
  } else {
      const size = document.getElementById('size');
      size.style.color = 'red';
      size.textContent = 'Please select size';

      setTimeout(() => {
          size.style.color = '';
          size.textContent = '';
      }, 6000);
      return;
  }
}




const addToCart = (productid) =>  {

    const index = document.getElementById('productName').getAttribute('data-index')
    console.log(productid, index)
  try {
    
    
    $.ajax({
        type: "POST",
        url: '/checkSession',
        success: (response) => {
            
            if(response.session) {
              console.log(true, 'yaaaaaaaaaaaa')
                addToDb(productid, index);
            } else {
                const product = [productid, index];
                localStorage.setItem('product', product);
            }
        }
    })
  } catch (error) {
    console.log(error);
  }
   

}

function proccedTOCheckOut() {
  try {
      const session = document.getElementById('btn').getAttribute('data-session');
      console.log(session)
      // if(!session) {

      //   Swal.fire({
      //     title: "LogIn",
      //     text: "Please login to procced",
      //     icon: "warning"
      //   }).then((result) => {
      //      if(result.isConfirmed) {
      //         window.location = '/login';
      //      }
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   })
      // }
    
        window.location = '/check-out'
    
      
  } catch (error) {
    console.log(error)
  }
}