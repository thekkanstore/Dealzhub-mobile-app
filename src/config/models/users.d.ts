export interface IUserTable {
  id: string;
  name: string;
  email: string;
  phoneNumber: number | string;
  address: string;
  city: any;
  state: string;
  role?: Array<string>; // default user, vendor
  notification?: string;
  vendorIsActive?: boolean;
  vendorApprovalStatus?: string | null; // null, Pending, Approved, Rejected

  cartItems?: Array<string>; // array of products id
  favorites?: Array<string>; // array of products id

  isAgreeTermsAndCondition?: boolean;
  photo?: string;
  created_at?: any;
  updated_at?: any;
  createdAt?: any;
  updatedAt?: any;
}
