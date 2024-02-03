// @ts-check
const path = require("path");
const fs = require("fs");

// ---- Miscellaneous -------------------------------------------------------------------------------------------------
const authIsAdmin = "root.child('admins').child(auth.uid).val() === true";
const authUidIsUid = "auth.uid === $uid";
const authNotNull = "auth !== null";
const isNumber = "newData.isNumber()";
const authIsDataOwner = (dataType) =>
  `root.child('owners').child(${dataType}).child($dataKey).child(auth.uid).exists()`;
const authIsDataOwnerArgs = (dataType, dataKey) =>
  `root.child('owners').child(${dataType}).child(${dataKey}).child(auth.uid).exists()`;
const rootData = "root.child('data').child($dataType).child($dataKey)";
const rootDataArgs = (dataType, dataKey) => `root.child('data').child(${dataType}).child(${dataKey})`;
const rootDataDoesNotExist = `!${rootData}.exists()`;
const rootDataDoesNotExistArgs = (dataType, dataKey) => `!${rootDataArgs(dataType, dataKey)}.exists()`;
const publicAccess = "data.child('publicAccess').val() === true";
const rootDataPublicAccess = `${rootData}.child('publicAccess').val() === true`;
const rootDataPublicAccessArgs = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('publicAccess').val() === true`;

// TODO: Add `.emailVerified` check to all rules (this will affect sign-up, you will have to wait until after verification to create any data)
// TODO: ie. const authUidIsValid = "auth.uid === $uid && root.child('users').child(auth.uid).child('emailVerified').val() === true";

/**
 * This makes `appUser` a necessary part of soil - it must be connected to everything that they want
 * to read that is not public and that they do not own or have `connectionAccess/read` permissions.
 */
const isAppUserConnected = (type, key) =>
  `root.child('connectionDataLists').child('appUser').child(auth.uid).child(${type}).child(${key}).exists()`;
// --------------------------------------------------------------------------------------------------------------------

// ---- `remoteRequestUid` --------------------------------------------------------------------------------------------
const sameRemoteRequestUid = `data.child('remoteRequestUid').val() === newData.child('remoteRequestUid').val()`;
const createdYourRemoteRequestUid = `!data.child('remoteRequestUid').exists() && newData.child('remoteRequestUid').exists() && newData.child('remoteRequestUid').val() === auth.uid`;
/** Either it's unchanged, it's new and it's you, or you're deleting the dataValue */
const safeRemoteRequestUid = `((${sameRemoteRequestUid}) || (${createdYourRemoteRequestUid}) || !newData.exists())`;

const isNewOwnedRemoteRequestUid = "!data.exists() && newData.child('remoteRequestUid').val() === auth.uid";
const isExistingOwnedRemoteRequestUid = "data.child('remoteRequestUid').val() === auth.uid";
const isNewOrExistingOwnedRemoteRequestUid = `(${isNewOwnedRemoteRequestUid}) || (${isExistingOwnedRemoteRequestUid})`;
// --------------------------------------------------------------------------------------------------------------------

// ---- `ownershipAccess` ---------------------------------------------------------------------------------------------
const ownershipAccessType = "data.child('ownershipAccess/dataType').val()";
const rootDataOwnershipAccessType = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('ownershipAccess/dataType').val()`;
const ownershipAccessKey = "data.child('ownershipAccess/dataKey').val()";
const rootDataOwnershipAccessKey = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('ownershipAccess/dataKey').val()`;
const readOwnershipAccessBoolean = "data.child('ownershipAccess/read').val() === true";
const rootDataReadOwnershipAccessBoolean = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('ownershipAccess/read').val() === true`;
const rootDataWriteOwnershipAccessBoolean = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('ownershipAccess/write').val() === true`;
const writeOwnershipAccessBoolean = "data.child('ownershipAccess/write').val() === true";
const ownershipAccess = `root.child('owners').child(${ownershipAccessType}).child(${ownershipAccessKey}).child(auth.uid).exists()`;
const ownershipAccessArgs = (accessType, accessKey) =>
  `root.child('owners').child(${accessType}).child(${accessKey}).child(auth.uid).exists()`;
const rootDataOwnershipAccess = (dataType, dataKey) =>
  ownershipAccessArgs(
    rootDataOwnershipAccessType(dataType, dataKey),
    rootDataOwnershipAccessKey(dataType, dataKey) //
  );
const hasRootReadOwnershipAccess = (dataType, dataKey) =>
  `${rootDataReadOwnershipAccessBoolean(dataType, dataKey)} && ${rootDataOwnershipAccess(dataType, dataKey)}`;
const hasRootWriteOwnershipAccess = (dataType, dataKey) =>
  `${rootDataWriteOwnershipAccessBoolean(dataType, dataKey)} && ${rootDataOwnershipAccess(dataType, dataKey)}`;
// --------------------------------------------------------------------------------------------------------------------

// ---- `connectionAccess` --------------------------------------------------------------------------------------------
const connectionAccessType = "data.child('connectionAccess/connectionType').val()";
const rootDataConnectionAccessType = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('connectionAccess/connectionType').val()`;
const connectionAccessKey = "data.child('connectionAccess/connectionKey').val()";
const rootDataConnectionAccessKey = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('connectionAccess/connectionKey').val()`;
const uidDataType = "data.child('connectionAccess/uidDataType').val()";
const rootDataUidDataType = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('connectionAccess/uidDataType').val()`;
const readConnectionAccessBoolean = "data.child('connectionAccess/read').val() === true";
const rootDataReadConnectionAccessBoolean = (dataType, dataKey) =>
  `${rootDataArgs(dataType, dataKey)}.child('connectionAccess/read').val() === true`;
const writeConnectionAccessBoolean = "data.child('connectionAccess/write').val() === true";
const connectionAccess = `root.child('connectionDataLists').child(${connectionAccessType}).child(${connectionAccessKey}).child(${uidDataType}).child(auth.uid).exists()`;
const connectionAccessArgs = (accessType, accessKey, uidType) =>
  `root.child('connectionDataLists').child(${accessType}).child(${accessKey}).child(${uidType}).child(auth.uid).exists()`;
const rootDataConnectionAccess = (dataType, dataKey) =>
  connectionAccessArgs(
    rootDataConnectionAccessType(dataType, dataKey),
    rootDataConnectionAccessKey(dataType, dataKey),
    rootDataUidDataType(dataType, dataKey)
  );
const hasRootReadConnectionAccess = (dataType, dataKey) =>
  `${rootDataReadConnectionAccessBoolean(dataType, dataKey)} && ${rootDataConnectionAccess(dataType, dataKey)}`;
// --------------------------------------------------------------------------------------------------------------------

const oneHalfOfConnectionWriteAccess = (type, key) =>
  `(${rootDataPublicAccessArgs(type, key)}) || (${rootDataDoesNotExistArgs(type, key)}) || (${authIsDataOwnerArgs(
    type,
    key
  )}) || (${isAppUserConnected(type, key)}) || (${hasRootReadConnectionAccess(
    type,
    key
  )}) || (${hasRootReadOwnershipAccess(type, key)})`;

const readAsOwnerOrReadOwnershipAccess = (dataType, dataKey) =>
  `(${authIsDataOwner(dataType)}) || (${hasRootReadOwnershipAccess(dataType, dataKey)})`;
const writeAsOwnerOrWriteOwnershipAccess = (dataType, dataKey) =>
  `(${authIsDataOwner(dataType)}) || (${hasRootWriteOwnershipAccess(dataType, dataKey)})`;

/**
 * ! Overview:
 * You can become an owner only of data that doesn't exist or if an existing owner makes you an owner.
 * Your `userDataLists` are only for data you own.
 * You can read all connection keys, but you can only write connections if you own the data or if it is public and you are logged in.
 * You can read data that you are connected to, own, or have `connectionAccess/read`.
 * You can write data that you are own or have `connectionAccess/write`.
 *
 * ! Notes regarding making connections and reading data structure:
 * * `appUser`:
 * This is now a Soil reserved name like `user` and must be public so that connections can be created between a user and
 * a piece of data that someone owns (private user information can go elsewhere). This is how you can give access to someone.
 * ? Example: A manager wants to add a user to a project that the manager owns when the manager does not own the user.
 *
 * * "Permission handshake":
 * Even without `appUser`, this method allows connection creation: One user creates a permissions request
 * and sets himself and the other as owners. If the other owner accepts, a firebase trigger function
 * activates the connection between the two ends of the handshake request.
 * ? Example: A friend request for private profiles
 */
const rules = {
  // Admins have full read/write permissions on the database
  ".read": authIsAdmin,
  ".write": authIsAdmin,
  usernames: {
    // * If using this `usernames` feature, make sure to update this db location whenever changing `appUser.username` (either via the client or a trigger function)
    $username: {
      // Anyone, logged in or not, can read the list of usernames
      ".read": "true",
      // You can write your own uid here if it is a new username or if the existing username/uid is yours
      ".write": "newData.val() === auth.uid && (!data.exists() || data.val() === auth.uid)",
    },
  },
  unverifiedUsers: {
    // Users have full read/write permissions on themselves
    $uid: {
      ".read": authUidIsUid,
      ".write": authUidIsUid,
    },
  },
  users: {
    // Users have full read/write permissions on themselves
    $uid: {
      ".read": authUidIsUid,
      ".write": authUidIsUid,
    },
  },
  tracking: {
    $trackingKey: {
      // You can track only new instances (no updates), you must be logged in, and the included uid must be your own
      ".write": `!data.exists() && ${authNotNull} && newData.child('uid').val() === auth.uid`,
    },
  },
  owners: {
    $dataType: {
      $dataKey: {
        // You can only read your own ownership keys or check the owners of a data type if you have ownership read access
        ".read": `data.child(auth.uid).exists() || ${readAsOwnerOrReadOwnershipAccess("$dataType", "$dataKey")}`,
        // You can write ownership for a location if the data does not yet exist so that you can prepare to create the data
        // You can also write new ownership for others if you yourself are an owner or have ownership write acces
        ".write": `(${rootDataDoesNotExist}) || ${writeAsOwnerOrWriteOwnershipAccess("$dataType", "$dataKey")}`,
      },
    },
  },
  userDataLists: {
    // Users have full read/write permissions on their ownership lists
    $uid: {
      ".read": authUidIsUid,
      ".write": authUidIsUid,
      $dataType: {
        ".indexOn": ".value",
        // If you own the data, you can also make other people owners of the data and therefore add to their ownership lists
        // You can also do read and write this location if you have the appropriate ownership access
        $dataKey: {
          ".read": readAsOwnerOrReadOwnershipAccess("$dataType", "$dataKey"),
          ".write": writeAsOwnerOrWriteOwnershipAccess("$dataType", "$dataKey"),
          ".validate": isNumber,
        },
      },
    },
  },
  publicDataLists: {
    $dataType: {
      // Public lists are public to all...
      ".read": true,
      ".indexOn": ".value",
      $dataKey: {
        // ...but they can only be written to by their owners
        ".write": `(${rootDataDoesNotExist}) || (${writeAsOwnerOrWriteOwnershipAccess("$dataType", "$dataKey")})`,
        ".validate": isNumber,
      },
    },
  },
  data: {
    $dataType: {
      $dataKey: {
        // You can read a data location if it doesn't exist (so that you can listen for a location that will eventually exist)
        // You can also read a data location if it is public access, you own it, you have connection read access, you are connected to it, or have access via your remoteRequestUid
        ".read": `!data.exists() || (${publicAccess}) || (${isExistingOwnedRemoteRequestUid}) || (${authIsDataOwner(
          "$dataType"
        )}) || (${isAppUserConnected(
          "$dataType",
          "$dataKey"
        )}) || (${readConnectionAccessBoolean} && ${connectionAccess}) || (${readOwnershipAccessBoolean} && ${ownershipAccess})`,
        // You can write a data location if it doesn't exist (so that you can create data that you might not want to own)
        // You can also write a data location if you own it, have connection write access, ownership write access, or have access via your remoteRequestUid
        // Also, once set, disallow changing the `remoteRequestUid`
        ".write": `!data.exists() || (${safeRemoteRequestUid}) && ((${authIsDataOwner(
          "$dataType"
        )}) || (${isNewOrExistingOwnedRemoteRequestUid}) || (${writeConnectionAccessBoolean} && ${connectionAccess}) || (${writeOwnershipAccessBoolean} && ${ownershipAccess}))`,
      },
    },
  },
  connectionDataLists: {
    $dataType: {
      $dataKey: {
        // You can read the connections if the data is public or you own this end of the data
        ".read": `(${rootDataPublicAccess}) || (${readAsOwnerOrReadOwnershipAccess("$dataType", "$dataKey")})`,
        // You can write the connections if you own the data or if you have connection write access
        ".write": writeAsOwnerOrWriteOwnershipAccess("$dataType", "$dataKey"),
        $connectionType: {
          // As long as you are logged in, you can read all the keys of a connection so that you can listen to the connection lists
          // ? Example: A user wanting to read connections between a product and a category, neither of which they own
          ".read": authNotNull,
          ".indexOn": ".value",
          $connectionKey: {
            // You can only write new connections if both ends follow the same rules.
            // This is because connections give you read access to data, and they are always two-way.
            // You must be logged in, and each end must be either: public, non-existant, owned, connected, have connection read access, or have ownership read access
            // The non-existant check is for when we create connections that are just reference points but data is not actually at the location
            // ? Example: A user wanting to create a connection between a cart (that they own or doesn't technically exist) and a product (for which they have connection read access)
            // For managing creating new connections, see: "! Notes regarding making connections and reading data structure"
            ".write": `${authNotNull} && (${oneHalfOfConnectionWriteAccess(
              "$dataType",
              "$dataKey"
            )}) && (${oneHalfOfConnectionWriteAccess("$connectionType", "$connectionKey")})`,
            ".validate": isNumber,
          },
        },
      },
    },
  },
};

fs.writeFileSync(path.resolve(__dirname, "./database.rules.json"), `${JSON.stringify({ rules }, null, 2)}\n`);
