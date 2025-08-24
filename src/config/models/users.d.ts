export interface IUserTable {
  id: number;
  username: string;
  email: string;
  phoneNumber: number;
  address: string;
  city: string;
  state: string;
  role: Array<string>; // default user, vendor
  notification: boolean;
  vendorIsActive: boolean;
  vendorApprovalStatus: string | null; // null, Pending , Approved , Rejected

  cartItems: Array<number>; // array of products id
  favorites: Array<number>; // array of products id

  created_at: Date;
  updated_at: Date;
}
