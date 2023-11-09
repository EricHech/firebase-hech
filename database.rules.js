// @ts-check
const path = require("path");
const fs = require("fs");

// Miscellaneous
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

// `connectionAccess`
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

/**
 * This makes `appUser` a necessary part of soil - it must be connected to everything that they want
 * to read that is not public and that they do not own or have `connectionAccess/read` permissions.
 */
const isAppUserConnected =
  "root.child('connectionDataLists').child('appUser').child(auth.uid).child($dataType).child($dataKey).exists()";

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
  userDataLists: {
    // Users have full read/write permissions on their ownership lists
    $uid: {
      ".read": authUidIsUid,
      ".write": authUidIsUid,
      $dataType: {
        // If you own the data, you can also make other people owners of the data and therefore add to their ownership lists
        $dataKey: {
          ".read": authIsDataOwner("$dataType"),
          ".write": authIsDataOwner("$dataType"),
          ".validate": isNumber,
        },
      },
    },
  },
  publicDataLists: {
    $dataType: {
      // Public lists are public to all...
      ".read": true,
      $dataKey: {
        // ...but they can only be written to by their owners
        ".write": authIsDataOwner("$dataType"),
        ".validate": isNumber,
      },
    },
  },
  data: {
    $dataType: {
      $dataKey: {
        // You can read a data location if it doesn't exist (so that you can listen for a location that will eventually exist)
        // You can also read a data location if it is public access, you own it, you have connection read access, or you are connected to it
        ".read": `!data.exists() || (${publicAccess}) || (${authIsDataOwner(
          "$dataType"
        )}) || (${readConnectionAccessBoolean} && ${connectionAccess}) || (${isAppUserConnected})`,
        // You can write a data location if you own it or you have connection write access
        ".write": `(${authIsDataOwner("$dataType")}) || (${writeConnectionAccessBoolean} && ${connectionAccess})`,
      },
    },
  },
  owners: {
    $dataType: {
      $dataKey: {
        // You can only read your own ownership keys
        ".read": "data.child(auth.uid).exists()",
        // You can write ownership for a location if the data does not yet exist so that you can prepare to create the data
        // You can also write new ownership for others if you yourself are an owner
        ".write": `(${rootDataDoesNotExist}) || data.child(auth.uid).exists()`,
      },
    },
  },
  connectionDataLists: {
    $dataType: {
      $dataKey: {
        // You can read the connections if the data is public or you own this end of the data
        ".read": `(${rootDataPublicAccess}) || (${authIsDataOwner("$dataType")})`,
        // You can write the connections if you own the data or if you have connection write access
        ".write": authIsDataOwner("$dataType"),
        $connectionType: {
          // But really, you can read all the keys of a connection so that you can listen to the connection lists
          // ? Example: A user wanting to read connections between a product and a category, neither of which they own
          ".read": true,
          $connectionKey: {
            // You can only write new connections if both ends follow the same rules.
            // This is because connections give you read access to data, and they are always two-way.
            // You must be logged in, and each end must be either: public, non-existant, owned, or have connection read access
            // The non-existant check is for when we create connections that are just reference points but data is not actually at the location
            // ? Example: A user wanting to create a connection between a cart (that they own or doesn't technically exist) and a product (for which they have connection read access)
            // For managing creating new connections, see: "! Notes regarding making connections and reading data structure"
            ".write": `${authNotNull} && ((${rootDataPublicAccessArgs(
              "$dataType",
              "$dataKey"
            )}) || (${rootDataDoesNotExistArgs("$dataType", "$dataKey")}) || (${authIsDataOwnerArgs(
              "$dataType",
              "$dataKey"
            )}) || (${hasRootReadConnectionAccess("$dataType", "$dataKey")})) && ((${rootDataPublicAccessArgs(
              "$connectionType",
              "$connectionKey"
            )}) || (${rootDataDoesNotExistArgs("$connectionType", "$connectionKey")}) || (${authIsDataOwnerArgs(
              "$connectionType",
              "$connectionKey"
            )}) || (${hasRootReadConnectionAccess("$connectionType", "$connectionKey")}))`,
            ".validate": isNumber,
          },
        },
      },
    },
  },
};

fs.writeFileSync(path.resolve(__dirname, "./database.rules.json"), `${JSON.stringify({ rules }, null, 2)}\n`);
