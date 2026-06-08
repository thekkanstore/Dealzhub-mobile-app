/**
 * 
 * Table Users {
  id integer [primary key]
  username varchar [not null]
  email varchar [not null]
  phoneNumber integer [not null]
  address string [not null]
  city string [not null]
  state string [not null]
  role arry [] // default user, vendor
  notification boolean [not null]
  vendorIsActive boolean [not null]
  vendorApprovalStatus string// null, Pending , Approved , Rejected

  cartItems arr // array of products id
  favorites arr // array of products id

  created_at timestamp
  updated_at timestampm
}


Table  Store {
   id integer [primary key]
   userId integer [not null]
   isActive boolean
   email varchar [not null]
   phoneNumber integer [not null]
   address string [not null]
   categories arr 
   city string [not null]
   state string [not null]
   created_at timestamp
   updated_at timestampm
}

Table Category {
   id integer [primary key] 
   name string 
   isActive boolen
   created_at timestamp
   updated_at timestamp
}

Table Product {
   id integer [primary key]
   storeId integer [not null]
   name string
   description string
   image string
   actualPrice string
   discountPrice string
  //  stockAccount number
   status string // instock , outofstock 
   categoryId string // 
   isSecondHand boolean
   isActive boolean
   created_at timestamp
   updated_at timestamp
}

Table OrderItem {
  id integer [primary key]
  producrId integer 
  userId integer 
  created_at timestamp
  updated_at timestampm
}
  */
